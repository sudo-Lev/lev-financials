import { describe, expect, it } from 'vitest'

import { createCurrency, createMoney, type Money } from '@/domain'

import { formatMoney } from './format-money'

function money(minorUnits: number, currencyCode: string): Money {
  const currency = createCurrency(currencyCode)

  if (!currency.ok) {
    throw new Error(`Expected valid synthetic currency fixture: ${currencyCode}`)
  }

  const result = createMoney(minorUnits, currency.value)

  if (!result.ok) {
    throw new Error(`Expected valid synthetic money fixture: ${minorUnits}`)
  }

  return result.value
}

describe('formatMoney', () => {
  it('formats supported dashboard currencies with an explicit locale', () => {
    expect(formatMoney(money(12_345, 'PLN'), { currencyDisplay: 'code', locale: 'pl-PL' })).toBe(
      '123,45 PLN',
    )
    expect(formatMoney(money(12_345, 'USD'), { currencyDisplay: 'code', locale: 'en-US' })).toBe(
      'USD 123.45',
    )
    expect(formatMoney(money(12_345, 'EUR'), { currencyDisplay: 'code', locale: 'de-DE' })).toBe(
      '123,45 EUR',
    )
    expect(formatMoney(money(12_345, 'UAH'), { currencyDisplay: 'code', locale: 'uk-UA' })).toBe(
      '123,45 UAH',
    )
  })

  it('preserves negative sub-unit values without floating-point conversion', () => {
    expect(formatMoney(money(-5, 'PLN'), { currencyDisplay: 'code', locale: 'pl-PL' })).toBe(
      '-0,05 PLN',
    )
  })

  it('uses currency metadata instead of assuming two fraction digits', () => {
    expect(formatMoney(money(12_345, 'JPY'), { currencyDisplay: 'code', locale: 'ja-JP' })).toBe(
      'JPY 12,345',
    )
    expect(formatMoney(money(12_345, 'KWD'), { currencyDisplay: 'code', locale: 'en-US' })).toBe(
      'KWD 12.345',
    )
  })
})
