export abstract class WalletDebitPort {
  abstract sendDebit(url: string, data: DebitWalletRequest): Promise<any>;
}

export interface DebitWalletRequest {
  user_id: string;
  amount: number;
  round_id: string;
  bet_id: string;
  game_id: string;
  bet_code: string;
  bet_date: string | Date;
  platform: string;
  currency: string;
  transactionType: 'bet';
}
