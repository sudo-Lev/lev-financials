import { describe, expect, it } from 'vitest'

import { createCurrency, type Currency } from '@/domain/currency'

import { createExchangeRate } from './exchange-rate'

function currency(code: string): Currency {
  const result = createCurrency(code)

  if (!result.ok) {
    throw new Error(`Expected valid synthetic currency fixture: ${code}`)
  }

  return result.value
}

describe('ExchangeRate', () => {
  const uah = currency('UAH')
  const pln = currency('PLN')

  it('stores a decimal rate as an exact reduced ratio', () => {
    expect(
      createExchangeRate({
        denominator: 10_000,
        fromCurrency: uah,
        numerator: 842,
        toCurrency: pln,
      }),
    ).toEqual({
      ok: true,
      value: expect.objectContaining({ denominator: 5_000, numerator: 421 }),
    })
  })

  it.each([
    [0, 100],
    [1, 0],
    [-1, 100],
    [1.5, 100],
  ])('rejects invalid ratio %s/%s', (numerator, denominator) => {
    expect(
      createExchangeRate({ denominator, fromCurrency: uah, numerator, toCurrency: pln }),
    ).toEqual({
      error: {
        code: 'invalid_exchange_rate',
        reason: 'ratio_must_be_positive_safe_integers',
      },
      ok: false,
    })
  })

  it('rejects a same-currency rate', () => {
    expect(
      createExchangeRate({ denominator: 100, fromCurrency: pln, numerator: 100, toCurrency: pln }),
    ).toEqual({
      error: { code: 'invalid_exchange_rate', reason: 'currencies_must_differ' },
      ok: false,
    })
  })
})
