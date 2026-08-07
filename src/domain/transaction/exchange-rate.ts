import { isSameCurrency, type Currency } from '@/domain/currency'
import { failure, type Result, success } from '@/domain/shared/result'

export type ExchangeRate = Readonly<{
  denominator: number
  fromCurrency: Currency
  numerator: number
  toCurrency: Currency
}>

export type ExchangeRateValidationError = Readonly<{
  code: 'invalid_exchange_rate'
  reason: 'currencies_must_differ' | 'ratio_must_be_positive_safe_integers'
}>

export function createExchangeRate(input: {
  denominator: number
  fromCurrency: Currency
  numerator: number
  toCurrency: Currency
}): Result<ExchangeRate, ExchangeRateValidationError> {
  if (
    !Number.isSafeInteger(input.numerator) ||
    !Number.isSafeInteger(input.denominator) ||
    input.numerator <= 0 ||
    input.denominator <= 0
  ) {
    return failure({
      code: 'invalid_exchange_rate',
      reason: 'ratio_must_be_positive_safe_integers',
    })
  }

  if (isSameCurrency(input.fromCurrency, input.toCurrency)) {
    return failure({ code: 'invalid_exchange_rate', reason: 'currencies_must_differ' })
  }

  const divisor = greatestCommonDivisor(input.numerator, input.denominator)

  return success(
    Object.freeze({
      denominator: input.denominator / divisor,
      fromCurrency: input.fromCurrency,
      numerator: input.numerator / divisor,
      toCurrency: input.toCurrency,
    }),
  )
}

function greatestCommonDivisor(left: number, right: number): number {
  let current = left
  let remainder = right

  while (remainder !== 0) {
    const next = current % remainder
    current = remainder
    remainder = next
  }

  return current
}
