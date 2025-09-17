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
import { BetHelpers } from '../application/bet-helpers';
import { OperatorLimitCache } from './implementations/operator-limit.implementation';
import { OperatorLimitCachePort } from '../domain/operator-limit-cache.port';
import { ValidateLimitBet } from '../application/validate-limits-bet.helper';
import { WalletDebit } from './implementations/wallet-debit.implementation';
import { WalletDebitPort } from '../domain/wallet-debit.port';
import { CreateBetProcessor } from './processors/create-bet.processor';

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
    BetHelpers,
    CreateBetProcessor,
    CreateBetUseCase,
    CurrencyCache,
    OperatorCache,
    OperatorLimitCache,
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
      provide: OperatorLimitCachePort,
      useExisting: OperatorLimitCache,
    },
    {
      provide: PlayerCachePort,
      useExisting: PlayerCache,
    },
    {
      provide: RouletteCachePort,
      useExisting: RouletteCache,
    },
    ValidateLimitBet,
    WalletDebit,
    {
      provide: WalletDebitPort,
      useExisting: WalletDebit,
    },
  ],
})
export class BetsModule {}
