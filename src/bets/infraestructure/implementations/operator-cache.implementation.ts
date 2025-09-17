import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OperatorCachePort } from 'src/bets/domain/operator-cache.port';
import { OperatorEntity } from 'src/shared/interfaces';

@Injectable()
export class OperatorCache implements OperatorCachePort {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}
  async findById(operatorId: string): Promise<OperatorEntity | null> {
    const resp: any = await this.cacheManager.get(`operator:${operatorId}`);
    if (!resp) return null;
    return JSON.parse(resp);
  }
  async save(operatorId: string, ttl: number, data: any): Promise<string> {
    return await this.cacheManager.set(
      `operator:${operatorId}`,
      JSON.stringify(data),
      ttl,
    );
  }
}
