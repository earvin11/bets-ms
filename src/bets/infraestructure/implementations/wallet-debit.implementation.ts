import { Injectable } from '@nestjs/common';
import {
  DebitWalletRequest,
  WalletDebitPort,
} from 'src/bets/domain/wallet-debit.port';
import { LoggerPort } from 'src/logging/domain/logger.port';

@Injectable()
export class WalletDebit implements WalletDebitPort {
  constructor(private readonly loggerPort: LoggerPort) {}
  async sendDebit(url: string, data: DebitWalletRequest): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Agrega otros headers si son necesarios
          // "Authorization": "Bearer token",
        },
        body: JSON.stringify(data),
      });

      // fetch no lanza error por códigos de estado HTTP, solo por problemas de red
      if (!response.ok && response.status >= 500) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Si esperas una respuesta JSON
      const responseData = await response.json();
      return {
        status: response.status,
        data: responseData,
        headers: response.headers,
        // Puedes agregar más propiedades para mantener compatibilidad
      };
    } catch (error) {
      this.loggerPort.error('ERROR IN DEBIT WALLET -> ', error.message);
      throw error;
    }
  }
}
