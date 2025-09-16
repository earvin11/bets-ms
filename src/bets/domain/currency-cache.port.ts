export abstract class CurrencyCachePort {
  abstract findByShort(short: string): Promise<any | null>;
  abstract save(short: string, ttl: number, data: any): Promise<string>;
}
