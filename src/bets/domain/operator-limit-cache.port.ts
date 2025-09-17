export abstract class OperatorLimitCachePort {
  abstract findByOperatorAndRoulette(
    operator: string,
    roulette: string,
    currency: string,
  ): Promise<string | null>;
  abstract saveRouletteLimit(
    operator: string,
    roulette: string,
    currency: string,
    data: any,
    ttl?: number,
  ): Promise<string>;
}
