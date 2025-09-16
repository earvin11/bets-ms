import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logging/infraestructure/logger.module';
import { RedisModule } from 'src/redis/infraestructure/redis.module';
import { QueueName } from 'src/shared/enums/queue-names.enum';
import { CurrencyCache } from './implementations/currency-cache.implementation';
import { OperatorCache } from './implementations/operator-cache.implementation';
import { PlayerCache } from './implementations/player-cache.implementation';
import { RouletteCache } from './implementations/roulette-cache.implementation';
import { CurrencyCachePort } from '../domain/currency-cache.port';
import { OperatorCachePort } from '../domain/operator-cache.port';
import { PlayerCachePort } from '../domain/player-cache.port';
import { RouletteCachePort } from '../domain/roulette-cache.port';
import { CreateBetUseCase } from '../application/create-bet.use-case';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.BET,
      defaultJobOptions: {
        removeOnComplete: 5,
        removeOnFail: 5,
      },
    }),
    CacheModule.register(),
    LoggerModule,
    RedisModule,
  ],
  providers: [
    CreateBetUseCase,
    CurrencyCache,
    OperatorCache,
    PlayerCache,
    RouletteCache,
    {
      provide: CurrencyCachePort,
      useExisting: CurrencyCache,
    },
    {
      provide: OperatorCachePort,
      useExisting: OperatorCache,
    },
    {
      provide: PlayerCachePort,
      useExisting: PlayerCache,
    },
    {
      provide: RouletteCachePort,
      useExisting: RouletteCache,
    },
  ],
})
export class BetsModule {}
