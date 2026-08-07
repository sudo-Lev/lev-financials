import { failure, type Result, success } from '@/domain/shared/result'

const ISO_4217_CODE_PATTERN = /^[A-Z]{3}$/
const CURRENCY_BRAND = Symbol('Currency')

export type Currency = Readonly<{
  code: string
  [CURRENCY_BRAND]: true
}>

export type CurrencyValidationError = Readonly<{
  code: 'invalid_currency_code'
  received: unknown
}>

export function createCurrency(input: unknown): Result<Currency, CurrencyValidationError> {
  if (typeof input !== 'string') {
    return failure({ code: 'invalid_currency_code', received: input })
  }

  const code = input.trim().toUpperCase()

  if (!ISO_4217_CODE_PATTERN.test(code)) {
    return failure({ code: 'invalid_currency_code', received: input })
  }

  return success(Object.freeze({ code, [CURRENCY_BRAND]: true as const }))
}

export function isSameCurrency(left: Currency, right: Currency): boolean {
  return left.code === right.code
}
