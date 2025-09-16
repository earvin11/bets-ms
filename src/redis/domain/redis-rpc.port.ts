export abstract class RedisRpcPort {
  abstract send<T>(pattern: string, data: any, timeoutMs?: number): Promise<T>;
  abstract publish(chanel: string, data: any): Promise<void>;
}
