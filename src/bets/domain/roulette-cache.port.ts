export abstract class RouletteCachePort {
  abstract findById(rouletteId: string): Promise<any | null>;
  abstract save(rouletteId: string, ttl: number, data: any): Promise<string>;
}
