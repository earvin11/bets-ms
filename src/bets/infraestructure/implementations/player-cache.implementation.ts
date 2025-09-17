import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PlayerCachePort } from 'src/bets/domain/player-cache.port';
import { PlayerEntity } from 'src/shared/interfaces';

@Injectable()
export class PlayerCache implements PlayerCachePort {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}
  async findById(playerId: string): Promise<PlayerEntity | null> {
    const resp: any = await this.cacheManager.get(`player:${playerId}`);
    if (!resp) return null;
    return JSON.parse(resp);
  }
  async save(playerId: string, ttl: number, data: any): Promise<string> {
    return await this.cacheManager.set(`player:${playerId}`, data, ttl);
  }
}
