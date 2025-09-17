import { Injectable } from '@nestjs/common';
import { RedisRpcPort } from 'src/redis/domain/redis-rpc.port';
import { BetFieldsAmerican } from '../../shared/interfaces';
import { RpcChannels } from 'src/shared/enums/rpc-channels.enum';
import { getEntityFromCacheOrDb } from 'src/shared/helpers/get-entity-from-cache-or-db.helper';
import { OperatorLimitCachePort } from '../domain/operator-limit-cache.port';

enum MessageErrors {
  LIMITS_NOT_FOUND = 'ERROR -> LIMITS NOT FOUND',
  TOTAL_AMOUNT_LEASTER_MIN_BET = 'ERROR -> TOTAL AMOUNT IS LEASTER THANT MIN BET',
  TOTAL_AMOUNT_GREATER_MAX_BET = 'ERROR -> TOTAL AMOUNT IS GREATER THANT MAX BET',
  PLENO_GREATER_LEASTER_LIMIT = 'PLENO IS GREATER OR LEASTER THAN LIMIT',
  SEMIPLENO_GREATER_LEASTER_LIMIT = 'SEMIPLENO IS GREATER OR LEASTER THAN LIMIT',
  CALLE_GREATER_LEASTER_LIMIT = 'CALLE IS GREATER OR LEASTER THAN LIMIT',
  LINEA_GREATER_LEASTER_LIMIT = 'LINEA IS GREATER OR LEASTER THAN LIMIT',
  CUADRO_GREATER_LEASTER_LIMIT = 'CUADRO IS GREATER OR LEASTER THAN LIMIT',
  COLUMNS_GREATER_LEASTER_LIMIT = 'COLUMNA IS GREATER OR LEASTER THAN LIMIT',
  COLOR_GREATER_LEASTER_LIMIT = 'COLOR IS GREATER OR LEASTER THAN LIMIT',
  CUBRE_GREATER_LEASTER_LIMIT = 'CUBRE IS GREATER OR LEASTER THAN LIMIT',
  DOZENS_GREATER_LEASTER_LIMIT = 'DOCENA IS GREATER OR LEASTER THAN LIMIT',
  EVEN_ODD_GREATER_LEASTER_LIMIT = 'EVEN ODD IS GREATER OR LEASTER THAN LIMIT',
  CHANCE_SIMPLE_GREATER_LEASTER_LIMIT = 'CHANCE SIMPLE IS GREATER OR LEASTER THAN LIMIT',
}

@Injectable()
export class ValidateLimitBet {
  constructor(
    private readonly operatorLimitCachePort: OperatorLimitCachePort,
    private readonly redisRpcPort: RedisRpcPort,
  ) {}

  async run(
    operatorId: string,
    rouletteId: string,
    currencyId: string,
    bet: BetFieldsAmerican,
    totalAmount: number,
  ) {
    const limits = await getEntityFromCacheOrDb(
      () =>
        this.operatorLimitCachePort.findByOperatorAndRoulette(
          operatorId,
          rouletteId,
          currencyId,
        ),
      () =>
        this.redisRpcPort.send<any>(
          RpcChannels.GET_OPERTOR_LIMIT_BY_CURRENCY_AND_ROULETTE,
          {
            operator: operatorId,
            roulette: rouletteId,
            currency: currencyId,
          },
        ),
      (data) =>
        this.operatorLimitCachePort.saveRouletteLimit(
          operatorId,
          rouletteId,
          currencyId,
          data,
          600000,
        ),
    );

    if (!limits) return { ok: false, msg: MessageErrors.LIMITS_NOT_FOUND };

    if (totalAmount < limits.minBet)
      return { ok: false, msg: MessageErrors.TOTAL_AMOUNT_LEASTER_MIN_BET };
    if (totalAmount > limits.maxBet)
      return { ok: false, msg: MessageErrors.TOTAL_AMOUNT_GREATER_MAX_BET };

    if (bet.plenoNumbers.length) {
      if (
        bet.plenoNumbers.some(
          (pleno) =>
            pleno.amount > limits.pleno.max || pleno.amount < limits.pleno.min,
        )
      )
        return { ok: false, msg: MessageErrors.PLENO_GREATER_LEASTER_LIMIT };
    }

    if (bet.semiPlenoNumbers.length) {
      const semiPlenosAmounts = bet.semiPlenoNumbers.reduce(
        (acc, current, i) => {
          if (i % 2 !== 0) {
            const amount =
              (bet.semiPlenoNumbers[i - 1].amount + current.amount) / 2;

            acc.push(amount);
          }
          return acc;
        },
        [] as Array<number>,
      );

      if (
        semiPlenosAmounts.some(
          (amount) =>
            amount > limits.semipleno.max || amount < limits.semipleno.min,
        )
      )
        return {
          ok: false,
          msg: MessageErrors.SEMIPLENO_GREATER_LEASTER_LIMIT,
        };
    }

    if (bet.calleNumbers.length) {
      const callesAmounts = bet.calleNumbers.reduce((acc, current, i) => {
        if ((i + 1) % 3 === 0) {
          const amount =
            (bet.calleNumbers[i - 2].amount +
              bet.calleNumbers[i - 1].amount +
              current.amount) /
            3;

          acc.push(amount);
        }
        return acc;
      }, [] as Array<number>);

      if (
        callesAmounts.some(
          (amount) => amount > limits.calle.max || amount < limits.calle.min,
        )
      )
        return { ok: false, msg: MessageErrors.CALLE_GREATER_LEASTER_LIMIT };
    }

    if (bet.lineaNumbers.length) {
      const lineaAmounts = bet.lineaNumbers.reduce((acc, current, i) => {
        if ((i + 1) % 6 === 0) {
          const amount =
            (bet.lineaNumbers[i - 5].amount +
              bet.lineaNumbers[i - 4].amount +
              bet.lineaNumbers[i - 3].amount +
              bet.lineaNumbers[i - 2].amount +
              bet.lineaNumbers[i - 1].amount +
              current.amount) /
            6;

          acc.push(amount);
        }
        return acc;
      }, [] as Array<number>);

      if (
        lineaAmounts.some(
          (amount) => amount > limits.linea.max || amount < limits.linea.min,
        )
      )
        return { ok: false, msg: MessageErrors.LINEA_GREATER_LEASTER_LIMIT };
    }

    if (bet.cuadroNumbers.length) {
      const cuadroAmounts = bet.cuadroNumbers.reduce((acc, current, i) => {
        if ((i + 1) % 4 === 0) {
          const amount =
            (bet.cuadroNumbers[i - 3].amount +
              bet.cuadroNumbers[i - 2].amount +
              bet.cuadroNumbers[i - 1].amount +
              current.amount) /
            4;

          acc.push(amount);
        }
        return acc;
      }, [] as Array<number>);

      if (
        cuadroAmounts.some(
          (amount) => amount > limits.cuadro.max || amount < limits.cuadro.min,
        )
      )
        return { ok: false, msg: MessageErrors.CUADRO_GREATER_LEASTER_LIMIT };
    }

    const columnsAmount = bet.columns.reduce(
      (acc, current) => (acc += current.amount),
      0,
    );

    if (bet.columns.length) {
      if (
        columnsAmount > limits.columna.max ||
        columnsAmount < limits.columna.min
      )
        return { ok: false, msg: MessageErrors.COLUMNS_GREATER_LEASTER_LIMIT };
    }

    const colorAmount = bet.color.reduce(
      (acc, current) => (acc += current.amount),
      0,
    );

    if (bet.color.length) {
      if (colorAmount > limits.color.max || colorAmount < limits.color.min)
        return { ok: false, msg: MessageErrors.COLOR_GREATER_LEASTER_LIMIT };
    }

    const cubreAmount = bet.cubre.reduce(
      (acc, current) => (acc += current.amount),
      0,
    );

    if (bet.cubre.length) {
      if (cubreAmount > limits.cubre.max || cubreAmount < limits.cubre.min)
        return { ok: false, msg: MessageErrors.CUBRE_GREATER_LEASTER_LIMIT };
    }

    const dozensAmount = bet.dozens.reduce(
      (acc, current) => (acc += current.amount),
      0,
    );

    if (bet.dozens.length) {
      if (dozensAmount > limits.docena.max || dozensAmount < limits.docena.min)
        return { ok: false, msg: MessageErrors.DOZENS_GREATER_LEASTER_LIMIT };
    }

    const evenOddAmount = bet.even_odd.reduce(
      (acc, current) => (acc += current.amount),
      0,
    );

    if (bet.even_odd.length) {
      if (
        evenOddAmount > limits.even_odd.max ||
        evenOddAmount < limits.even_odd.min
      )
        return { ok: false, msg: MessageErrors.EVEN_ODD_GREATER_LEASTER_LIMIT };
    }

    const chanceSimpleAmount = bet.chanceSimple.reduce(
      (acc, current) => (acc += current.amount),
      0,
    );

    if (bet.chanceSimple.length) {
      if (
        chanceSimpleAmount > limits.chanceSimple.max ||
        chanceSimpleAmount < limits.chanceSimple.min
      )
        return {
          ok: false,
          msg: MessageErrors.CHANCE_SIMPLE_GREATER_LEASTER_LIMIT,
        };
    }

    return { ok: true };
  }
}
