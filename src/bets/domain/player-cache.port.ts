export abstract class PlayerCachePort {
  abstract findById(playerId: string): Promise<any | null>;
  abstract save(playerId: string, ttl: number, data: any): Promise<string>;
}
