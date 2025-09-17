import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { OperatorLimitCachePort } from 'src/bets/domain/operator-limit-cache.port';

export class OperatorLimitCache implements OperatorLimitCachePort {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}
  async findByOperatorAndRoulette(
    operator: string,
    roulette: string,
    currency: string,
  ): Promise<any | null> {
    const data: any = await this.cacheManager.get(
      `operator-limit:${operator}-roulette${roulette}-currency${currency}`,
    );
    if (!data) return null;
    return JSON.parse(data);
  }
  async saveRouletteLimit(
    operator: string,
    roulette: string,
    currency: string,
    data: any,
    ttl: number = 180000,
  ): Promise<string> {
    return await this.cacheManager.set(
      `operator-limit:${operator}-roulette${roulette}-currency${currency}`,
      data,
      ttl,
    );
  }
}
