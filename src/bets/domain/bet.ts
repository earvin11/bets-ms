import { BetFieldsAmerican } from 'src/shared/interfaces';
import { randomUUID } from 'crypto';

export interface BetEntity {
  _id?: string;
  transactionId?: string;
  player: string;
  roulette: string;
  round: string;
  type: string;
  endpointError?: boolean;
  geolocation?: string;
  totalAmount: number;
  totalAmountPayoff: number;
  currency: string;
  isPaid?: boolean;
  openPay?: boolean;
  bet: BetFieldsAmerican;
  isWinner?: boolean;
  uuid?: string;
}

export class Bet implements BetEntity {
  public transactionId?: string;
  public player: string;
  public roulette: string;
  public round: string;
  public type: string;
  public endpointError?: boolean;
  public geolocation?: string;
  public totalAmount: number;
  public totalAmountPayoff: number;
  public currency: string;
  public isPaid?: boolean;
  public isWinner?: boolean;
  public openPay?: boolean;
  public bet: BetFieldsAmerican;
  public uuid?: string;

  constructor(data: BetEntity) {
    this.transactionId = randomUUID();
    this.player = data.player;
    this.roulette = data.roulette;
    this.round = data.round;
    this.type = data.type;
    this.endpointError = data.endpointError;
    this.geolocation = data.geolocation;
    this.totalAmount = data.totalAmount;
    this.totalAmountPayoff = data.totalAmountPayoff;
    this.currency = data.currency;
    this.isPaid = data.isPaid;
    this.isWinner = false;
    this.openPay = data.openPay;
    this.bet = data.bet;
    this.uuid = randomUUID();
  }
}
