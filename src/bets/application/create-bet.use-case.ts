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

interface CreateBetDto {
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
    private readonly operatorCachePort: OperatorCachePort,
    private readonly playerCachePort: PlayerCachePort,
    private readonly redisRpcPort: RedisRpcPort,
    private readonly rouletteCachePort: RouletteCachePort,
    private readonly validateLimitBet: ValidateLimitBet,
  ) {}

  async run(data: CreateBetDto) {
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
  }

  private emitError = (channel: string, msg: string, error?: string) => {
    const dataToEmit = { channel, msg, error };
    this.redisRpcPort.publish(
      SocketEventsEnum.BET_ERROR,
      JSON.stringify(dataToEmit),
    );
  };
}
