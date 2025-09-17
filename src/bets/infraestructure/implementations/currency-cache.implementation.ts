import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CurrencyCachePort } from 'src/bets/domain/currency-cache.port';
import { CurrencyEntity } from 'src/shared/interfaces';

@Injectable()
export class CurrencyCache implements CurrencyCachePort {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}
  async findByShort(short: string): Promise<CurrencyEntity | null> {
    const resp: any = await this.cacheManager.get(short);
    if (!resp) return null;
    return JSON.parse(resp);
  }
  async save(short: string, ttl: number, data: any): Promise<string> {
    return await this.cacheManager.set(
      `currency:${short}`,
      JSON.stringify(data),
      ttl,
    );
  }
}
