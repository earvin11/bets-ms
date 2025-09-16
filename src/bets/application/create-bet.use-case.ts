import { Injectable } from '@nestjs/common';
import { RedisRpcPort } from 'src/redis/domain/redis-rpc.port';
import { RpcChannels } from 'src/shared/enums/rpc-channels.enum';
import { CurrencyCachePort } from '../domain/currency-cache.port';
import { OperatorCachePort } from '../domain/operator-cache.port';
import { PlayerCachePort } from '../domain/player-cache.port';
import { RouletteCachePort } from '../domain/roulette-cache.port';
import { getEntityFromCacheOrDb } from 'src/shared/helpers/get-entity-from-cache-or-db.helper';

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
    private readonly currencyCachePort: CurrencyCachePort,
    private readonly operatorCachePort: OperatorCachePort,
    private readonly playerCachePort: PlayerCachePort,
    private readonly redisRpcPort: RedisRpcPort,
    private readonly rouletteCachePort: RouletteCachePort,
  ) {}

  async run(data: CreateBetDto) {
    const channelPlayerSocketPlayer = `${data.roulette}-${data.player}`;

    // TODO:
    // buscar currencyData, operator, roulette, rouletteFisic, player via RPC y cachear

    const [currencyData, operator, roulette, player] = await Promise.all([
      getEntityFromCacheOrDb(
        () => this.currencyCachePort.findByShort(data.currency),
        () =>
          this.redisRpcPort.send(RpcChannels.GET_CURRENCY_BY_SHORT, {
            currencyShort: data.currency,
          }),
        (currency) =>
          this.currencyCachePort.save(data.currency, 180000, currency),
      ),
      getEntityFromCacheOrDb(
        () => this.operatorCachePort.findById(data.operatorId),
        () =>
          this.redisRpcPort.send(RpcChannels.GET_OPERATOR_BY_ID, {
            operatorId: data.operatorId,
          }),
        (operator) =>
          this.operatorCachePort.save(data.operatorId, 180000, operator),
      ),

      getEntityFromCacheOrDb(
        () => this.rouletteCachePort.findById(data.roulette),
        () =>
          this.redisRpcPort.send(RpcChannels.GET_ROULETTE_BY_ID, {
            roulette: data.roulette,
          }),
        (roulette) =>
          this.rouletteCachePort.save(data.roulette, 18000, roulette),
      ),
      getEntityFromCacheOrDb(
        () => this.playerCachePort.findById(data.player),
        () =>
          this.redisRpcPort.send(RpcChannels.GET_PLAYER_BY_ID, {
            player: data.player,
          }),
        (player) => this.playerCachePort.save(data.player, 120000, player),
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
  }

  private emitError = (channel: string, msg: string, error?: string) => {
    const dataToEmit = { channel, msg, error };
    this.redisRpcPort.publish('bet:err', JSON.stringify(dataToEmit));
  };
}
