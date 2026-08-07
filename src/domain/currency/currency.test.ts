import { describe, expect, it } from 'vitest'

import { createCurrency, isSameCurrency } from './currency'

describe('Currency', () => {
  it.each(['PLN', 'USD', 'EUR', 'UAH', 'JPY', 'XTS'])('accepts ISO-shaped code %s', (code) => {
    const result = createCurrency(code)

    expect(result).toEqual(expect.objectContaining({ ok: true }))
    if (result.ok) {
      expect(result.value.code).toBe(code)
      expect(Object.isFrozen(result.value)).toBe(true)
    }
  })

  it('normalizes whitespace and letter case', () => {
    const result = createCurrency('  pln ')

    expect(result).toEqual(expect.objectContaining({ ok: true }))
    if (result.ok) {
      expect(result.value.code).toBe('PLN')
    }
  })

  it.each(['', 'PL', 'EURO', '12A', '€€€', 123, null])('rejects invalid input %j', (input) => {
    const result = createCurrency(input)

    expect(result).toEqual({
      error: { code: 'invalid_currency_code', received: input },
      ok: false,
    })
  })

  it('compares currencies by normalized code', () => {
    const first = createCurrency('uah')
    const second = createCurrency('UAH')
    const other = createCurrency('PLN')

    if (!first.ok || !second.ok || !other.ok) {
      throw new Error('Expected valid synthetic currency fixtures')
    }

    expect(isSameCurrency(first.value, second.value)).toBe(true)
    expect(isSameCurrency(first.value, other.value)).toBe(false)
  })
})
