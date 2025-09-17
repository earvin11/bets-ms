import { Injectable } from '@nestjs/common';
import { RedisRpcPort } from 'src/redis/domain/redis-rpc.port';
import { RpcChannels } from 'src/shared/enums/rpc-channels.enum';
import { CurrencyCachePort } from '../domain/currency-cache.port';
import { OperatorCachePort } from '../domain/operator-cache.port';
import { PlayerCachePort } from '../domain/player-cache.port';
import { RouletteCachePort } from '../domain/roulette-cache.port';
import { getEntityFromCacheOrDb } from 'src/shared/helpers/get-entity-from-cache-or-db.helper';
import { SocketEventsEnum } from 'src/shared/enums/socket-events.enum';
import { BetHelpers } from './bet-helpers';
import {
  CurrencyEntity,
  OperatorEntity,
  PlayerEntity,
  RouletteEntity,
} from 'src/shared/interfaces';
import { ValidateLimitBet } from './validate-limits-bet.helper';
import { Bet } from '../domain/bet';
import { WalletDebitPort } from '../domain/wallet-debit.port';
import { LoggerPort } from 'src/logging/domain/logger.port';

interface CreateBetDto {
  roundId: string;
  operatorId: string;
  roulette: string;
  currency: string;
  player: string;
  user_id: string;
  bet: any;
  identifierNumber: string;
  platform: string;
  player_ip: string;
  playerCountry: string;
  userAgent: string;
}

@Injectable()
export class CreateBetUseCase {
  constructor(
    private readonly betHelpers: BetHelpers,
    private readonly currencyCachePort: CurrencyCachePort,
    private readonly loggerPort: LoggerPort,
    private readonly operatorCachePort: OperatorCachePort,
    private readonly playerCachePort: PlayerCachePort,
    private readonly redisRpcPort: RedisRpcPort,
    private readonly rouletteCachePort: RouletteCachePort,
    private readonly validateLimitBet: ValidateLimitBet,
    private readonly walletDebitPort: WalletDebitPort,
  ) {}

  async run(data: CreateBetDto) {
    try {
      const channelPlayerSocketPlayer = `${data.roulette}-${data.player}`;

      const [currencyData, operator, roulette, player] = await Promise.all([
        getEntityFromCacheOrDb(
          () => this.currencyCachePort.findByShort(data.currency),
          () =>
            this.redisRpcPort.send<CurrencyEntity>(
              RpcChannels.GET_CURRENCY_BY_SHORT,
              {
                currencyShort: data.currency,
              },
            ),
          (currency) =>
            this.currencyCachePort.save(data.currency, 1200000, currency),
        ),
        getEntityFromCacheOrDb(
          () => this.operatorCachePort.findById(data.operatorId),
          () =>
            this.redisRpcPort.send<OperatorEntity>(
              RpcChannels.GET_OPERATOR_BY_ID,
              {
                operatorId: data.operatorId,
              },
            ),
          (operator) =>
            this.operatorCachePort.save(data.operatorId, 1200000, operator),
        ),

        getEntityFromCacheOrDb(
          () => this.rouletteCachePort.findById(data.roulette),
          () =>
            this.redisRpcPort.send<RouletteEntity>(
              RpcChannels.GET_ROULETTE_BY_ID,
              {
                roulette: data.roulette,
              },
            ),
          (roulette) =>
            this.rouletteCachePort.save(data.roulette, 1200000, roulette),
        ),
        getEntityFromCacheOrDb(
          () => this.playerCachePort.findById(data.player),
          () =>
            this.redisRpcPort.send<PlayerEntity>(RpcChannels.GET_PLAYER_BY_ID, {
              player: data.player,
            }),
          (player) => this.playerCachePort.save(data.player, 180000, player),
        ),
      ]);

      if (!currencyData) {
        this.emitError(channelPlayerSocketPlayer, 'Currency not found');
        return;
      }
      if (!operator) {
        this.emitError(channelPlayerSocketPlayer, 'Operator not found');
        return;
      }
      if (!roulette) {
        this.emitError(channelPlayerSocketPlayer, 'Roulette not found');
        return;
      }
      if (!player) {
        this.emitError(channelPlayerSocketPlayer, 'Player not found');
        return;
      }

      const totalAmount = this.betHelpers.calculateTotalAmount(data.bet);

      // Valida el length de los plenos
      if (
        !this.betHelpers.isValidPlenosLength(
          roulette.maxPlenosBet,
          data.bet.plenoNumbers,
        )
      ) {
        this.emitError(
          channelPlayerSocketPlayer,
          'Error, the length of the plenos is not valid',
        );
        return;
      }

      const { ok, msg } = await this.validateLimitBet.run(
        operator._id,
        roulette._id!,
        player.currency,
        data.bet,
        totalAmount,
      );
      if (!ok) {
        this.emitError(channelPlayerSocketPlayer, msg!);
        return;
      }

      const bet = new Bet({
        bet: data.bet,
        currency: player.currency,
        player: player._id!,
        roulette: roulette._id!,
        round: data.roundId,
        type: 'bet',
        totalAmount,
        totalAmountPayoff: 0,
      });

      const objWallet = {
        user_id: String(data.user_id),
        amount: totalAmount,
        round_id: data.identifierNumber,
        bet_id: bet.uuid!,
        game_id: data.roulette,
        bet_code: bet.transactionId!,
        bet_date: new Date(),
        currency: data.currency,
        platform: 'desktop',
        transactionType: 'bet' as const,
      };

      let walletResponse: any;
      const startTime = Date.now();
      try {
        walletResponse = await this.walletDebitPort.sendDebit(
          operator.endpointBet,
          objWallet,
        );
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.loggerPort.log('wallet debit success', {
          objWallet,
          walletResponse,
          duration,
        });

        if (!walletResponse.data.ok) {
          const log = {
            type: 'error',
            response: {
              message: `Error en la apuesta ${data.roulette}-${data.player}`,
              ...walletResponse.data,
            },
            request: {
              ...objWallet,
              url: operator.endpointBet,
            },
          };

          this.emitError(
            channelPlayerSocketPlayer,
            `Error in wallet response: ${walletResponse.data.msg ?? walletResponse.data.mensaje ?? walletResponse.data.message}`,
            'Error in wallet',
          );

          this.loggerPort.error('Wallet debit error', JSON.stringify(log));
          return;
        }
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        this.emitError(
          channelPlayerSocketPlayer,
          walletResponse.data.msg ??
            walletResponse.data.mensaje ??
            walletResponse.data.message,
          'Error in wallet',
        );
        this.loggerPort.error(
          'Wallet debit error',
          JSON.stringify({
            ...objWallet,
            walletResponse: walletResponse,
            duration,
            databet: bet,
          }),
        );
        return;
      }

      const newBet = await this.redisRpcPort.send(RpcChannels.CREATE_BET, bet);

      const { lastBalance: balanceWallet } = walletResponse.data;
      let userBalance = 0;
      if (balanceWallet && !isNaN(+balanceWallet)) userBalance = +balanceWallet;

      //TODO: mandar a crear transaccion y profit

      // si todo sale bien retorna esto
      const dataToEmit = {
        channel: channelPlayerSocketPlayer,
        msg: 'Success',
        bet: newBet,
        playersOnline: 5,
        userBalance,
      };
      this.redisRpcPort.publish(
        SocketEventsEnum.BET_SUCCESS,
        JSON.stringify(dataToEmit),
      );
    } catch (error) {
      this.emitError(
        `${data.roulette}-${data.player}`,
        'Internal server error',
      );
      this.loggerPort.error(
        'createBet error',
        JSON.stringify({
          error,
        }),
      );
      return;
    }
  }

  private emitError = (channel: string, msg: string, error?: string) => {
    const dataToEmit = { channel, msg, error };
    this.redisRpcPort.publish(
      SocketEventsEnum.BET_ERROR,
      JSON.stringify(dataToEmit),
    );
  };
}
