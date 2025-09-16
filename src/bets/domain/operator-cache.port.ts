export abstract class OperatorCachePort {
  abstract findById(operatorId: string): Promise<any | null>;
  abstract save(operatorId: string, ttl: number, data: any): Promise<string>;
}
