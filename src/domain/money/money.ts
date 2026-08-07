import { isSameCurrency, type Currency } from '@/domain/currency'
import { failure, type Result, success } from '@/domain/shared/result'

const MONEY_BRAND = Symbol('Money')

export type Money = Readonly<{
  currency: Currency
  minorUnits: number
  [MONEY_BRAND]: true
}>

export type MoneyValidationError = Readonly<{
  code: 'minor_units_must_be_safe_integer'
  received: number
}>

export type CurrencyMismatchError = Readonly<{
  code: 'currency_mismatch'
  leftCurrency: string
  rightCurrency: string
}>

export type MoneyArithmeticError = CurrencyMismatchError | MoneyValidationError
export type MoneyComparison = -1 | 0 | 1

export function createMoney(
  minorUnits: number,
  currency: Currency,
): Result<Money, MoneyValidationError> {
  if (!Number.isSafeInteger(minorUnits)) {
    return failure({ code: 'minor_units_must_be_safe_integer', received: minorUnits })
  }

  return success(Object.freeze({ currency, minorUnits, [MONEY_BRAND]: true as const }))
}

export function addMoney(left: Money, right: Money): Result<Money, MoneyArithmeticError> {
  const compatibility = validateMatchingCurrencies(left, right)

  if (!compatibility.ok) {
    return compatibility
  }

  return createMoney(left.minorUnits + right.minorUnits, left.currency)
}

export function subtractMoney(left: Money, right: Money): Result<Money, MoneyArithmeticError> {
  const compatibility = validateMatchingCurrencies(left, right)

  if (!compatibility.ok) {
    return compatibility
  }

  return createMoney(left.minorUnits - right.minorUnits, left.currency)
}

export function compareMoney(
  left: Money,
  right: Money,
): Result<MoneyComparison, CurrencyMismatchError> {
  const compatibility = validateMatchingCurrencies(left, right)

  if (!compatibility.ok) {
    return compatibility
  }

  if (left.minorUnits === right.minorUnits) {
    return success(0)
  }

  return success(left.minorUnits < right.minorUnits ? -1 : 1)
}

function validateMatchingCurrencies(
  left: Money,
  right: Money,
): Result<true, CurrencyMismatchError> {
  if (!isSameCurrency(left.currency, right.currency)) {
    return failure({
      code: 'currency_mismatch',
      leftCurrency: left.currency.code,
      rightCurrency: right.currency.code,
    })
  }

  return success(true)
}
