export interface NumberBet {
  number: number;
  amount: number;
}

interface EvenOddBet {
  type: 'EVEN' | 'ODD';
  amount: number;
}
interface ColorBet {
  type: 'RED' | 'BLACK';
  amount: number;
}

interface ColumnBet {
  type: 'FIRST' | 'SECOND' | 'THIRD';
  amount: number;
}
interface DozenBet {
  type: 'FIRST' | 'SECOND' | 'THIRD';
  amount: number;
}
interface ChanceSimpleBet {
  type: '1-18' | '19-36';
  amount: number;
}
interface CubreBet {
  type: '0-1-2' | '0-37-2' | '37-2-3';
  amount: number;
}

interface SpecialCalleBet {
  type: '37-0-1-2-3';
  amount: number;
}

export interface BetFieldsAmerican {
  plenoNumbers: NumberBet[];
  semiPlenoNumbers: NumberBet[];
  calleNumbers: NumberBet[];
  cuadroNumbers: NumberBet[];
  lineaNumbers: NumberBet[];
  even_odd: EvenOddBet[];
  color: ColorBet[];
  columns: ColumnBet[];
  dozens: DozenBet[];
  chanceSimple: ChanceSimpleBet[];
  cubre: CubreBet[];
  specialCalle: SpecialCalleBet[];
}

export interface OperatorEntity {
  status: boolean;
  available: boolean;
  buttonLobby: boolean;
  buttonSupport: boolean;
  background: string;
  logo: string;
  cruppierLogo: string;
  primaryColor: string;
  secondaryColor: string;
  useLogo: boolean;
  loaderLogo: string;
  _id: string;
  minBet: number | null;
  maxBet: number | null;
  uuid: string;
  name: string;
  client: string;
  endpointAuth: string;
  endpointBet: string;
  endpointWin: string;
  endpointRollback: string;
  operatorId: number;
  createdAt: Date;
  updatedAt: Date;
  urlGames: string;
}

export interface CurrencyEntity {
  _id?: string;
  name: string;
  short: string;
  symbol: string;
  usdExchange: number;
  exchangeApiURL: string;
  exchangeApi: boolean;
  status?: boolean;
  uuid?: string;
}

export interface RouletteEntity {
  type: string;
  doubleZero: boolean;
  language: string;
  status: boolean;
  lastJackpot: number;
  jackpotRounds: number;
  currenJackpotRound: number;
  jackpotWin?: any[];
  rollback: boolean;
  active: boolean;
  manualDisable: boolean;
  jackpotRandom: boolean;
  jackpotVersion: string;
  alertEmails: string[];
  maxRepeatedResults: number;
  multisAllowed: number[];
  isManualRoulette: boolean;
  numbersDistribution: string;
  bank: number;
  isShow: boolean;
  openingTime: string;
  closingTime: string;
  alwaysOpen: boolean;
  cameraVersion: string;
  initialBank: number;
  maximunBank: number;
  _id?: string;
  name: string;
  code: string;
  logo: string;
  imgBackground: string;
  color: string;
  providerId: string;
  pleno: number;
  semipleno: number;
  cuadro: number;
  calle: number;
  linea: number;
  columna: number;
  docena: number;
  chanceSimple: number;
  cubre: number;
  specialCalle: number;
  minBet: number;
  maxBet: number;
  maxBetPosition: number;
  urlTransmision: string;
  roundDuration: number;
  minutesToDisable: number;
  animals: any[];
  maxPlenosBet: number;
  numbersOfJackpot: number;
  saveRecordings: boolean;
}

export interface PlayerEntity {
  _id?: string;
  userId: string;
  username: string;
  operator: string;
  operatorUuid: string;
  currency: string;
  lastBalance: string;
  status?: boolean;
  isAdmin?: boolean;
  isPhysic?: boolean;
  board?: boolean;
  tokenWallet: string;
  WL: string;
}
