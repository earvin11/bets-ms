import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RouletteCachePort } from 'src/bets/domain/roulette-cache.port';
import { RouletteEntity } from 'src/shared/interfaces';

@Injectable()
export class RouletteCache implements RouletteCachePort {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}
  async findById(rouletteId: string): Promise<RouletteEntity | null> {
    const resp: any = await this.cacheManager.get(`roulette:${rouletteId}`);
    if (!resp) return null;
    return JSON.parse(resp);
  }
  async save(rouletteId: string, ttl: number, data: any): Promise<string> {
    return await this.cacheManager.set(
      `roulette:${rouletteId}`,
      JSON.stringify(data),
      ttl,
    );
  }
}
