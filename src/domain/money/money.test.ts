import { describe, expect, it } from 'vitest'

import { createCurrency, type Currency } from '@/domain/currency'

import { addMoney, compareMoney, createMoney, type Money, subtractMoney } from './money'

function validCurrency(code: string): Currency {
  const result = createCurrency(code)

  if (!result.ok) {
    throw new Error(`Expected valid synthetic currency fixture: ${code}`)
  }

  return result.value
}

function validMoney(minorUnits: number, currency: Currency): Money {
  const result = createMoney(minorUnits, currency)

  if (!result.ok) {
    throw new Error(`Expected valid synthetic money fixture: ${minorUnits}`)
  }

  return result.value
}

describe('Money', () => {
  const pln = validCurrency('PLN')
  const uah = validCurrency('UAH')

  it.each([1.25, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects non-safe minor units %s',
    (minorUnits) => {
      expect(createMoney(minorUnits, pln)).toEqual({
        error: { code: 'minor_units_must_be_safe_integer', received: minorUnits },
        ok: false,
      })
    },
  )

  it('creates immutable positive, zero, and negative amounts', () => {
    for (const minorUnits of [12_345, 0, -12_345]) {
      const result = createMoney(minorUnits, pln)

      expect(result).toEqual(expect.objectContaining({ ok: true }))
      if (result.ok) {
        expect(result.value).toEqual(expect.objectContaining({ currency: pln, minorUnits }))
        expect(Object.isFrozen(result.value)).toBe(true)
      }
    }
  })

  it('adds and subtracts amounts in the same currency', () => {
    const left = validMoney(12_345, pln)
    const right = validMoney(345, pln)

    expect(addMoney(left, right)).toEqual(
      expect.objectContaining({ ok: true, value: expect.objectContaining({ minorUnits: 12_690 }) }),
    )
    expect(subtractMoney(left, right)).toEqual(
      expect.objectContaining({ ok: true, value: expect.objectContaining({ minorUnits: 12_000 }) }),
    )
  })

  it('rejects implicit cross-currency arithmetic and comparison', () => {
    const zloty = validMoney(100, pln)
    const hryvnia = validMoney(100, uah)
    const expectedError = {
      error: { code: 'currency_mismatch', leftCurrency: 'PLN', rightCurrency: 'UAH' },
      ok: false,
    }

    expect(addMoney(zloty, hryvnia)).toEqual(expectedError)
    expect(subtractMoney(zloty, hryvnia)).toEqual(expectedError)
    expect(compareMoney(zloty, hryvnia)).toEqual(expectedError)
  })

  it('rejects arithmetic that overflows safe integer storage', () => {
    const maximum = validMoney(Number.MAX_SAFE_INTEGER, pln)
    const one = validMoney(1, pln)

    expect(addMoney(maximum, one)).toEqual({
      error: {
        code: 'minor_units_must_be_safe_integer',
        received: Number.MAX_SAFE_INTEGER + 1,
      },
      ok: false,
    })
  })

  it.each([
    [100, 200, -1],
    [200, 200, 0],
    [300, 200, 1],
  ] as const)('compares %i and %i minor units as %i', (left, right, expected) => {
    expect(compareMoney(validMoney(left, pln), validMoney(right, pln))).toEqual({
      ok: true,
      value: expected,
    })
  })
})
