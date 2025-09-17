import { Injectable } from '@nestjs/common';
import { BetsTypesEnum } from 'src/shared/enums/bets-types.enum';
import { BetFieldsAmerican, NumberBet } from 'src/shared/interfaces';

@Injectable()
export class BetHelpers {
  public calculateTotalAmount(bet: BetFieldsAmerican): number {
    let totalAmountInBet: number = 0;

    Object.keys(bet).forEach((keyBet) => {
      switch (keyBet) {
        case BetsTypesEnum.SEMI_PLENO: {
          const amount = this.calculateAmountNumbers(
            bet[BetsTypesEnum.SEMI_PLENO],
            2,
          );
          totalAmountInBet += amount;
          break;
        }
        case BetsTypesEnum.CALLE: {
          const amount = this.calculateAmountNumbers(
            bet[BetsTypesEnum.CALLE],
            3,
          );
          totalAmountInBet += amount;
          break;
        }
        case BetsTypesEnum.CUADRO: {
          const amount = this.calculateAmountNumbers(
            bet[BetsTypesEnum.CUADRO],
            4,
          );
          totalAmountInBet += amount;
          break;
        }
        case BetsTypesEnum.LINEA: {
          const amount = this.calculateAmountNumbers(
            bet[BetsTypesEnum.LINEA],
            6,
          );
          totalAmountInBet += amount;
          break;
        }

        default: {
          const currentBetArr = bet[keyBet];
          currentBetArr.forEach(({ amount }) => {
            totalAmountInBet += amount;
          });
        }
      }
    });

    return parseFloat(totalAmountInBet.toFixed(2));
  }
  public calculateAmountNumbers = (
    numbers: NumberBet[],
    iteratorNumber: number,
  ) => {
    let amount = 0;
    for (let i = 0; i <= numbers.length - iteratorNumber; i += iteratorNumber) {
      const currentBet = numbers[i];

      amount += currentBet.amount;
    }

    return amount;
  };
  public isValidPlenosLength = (
    maxPlenosBet: number,
    plenoNumbers: NumberBet[],
  ) => {
    return plenoNumbers.length < maxPlenosBet;
  };
}
