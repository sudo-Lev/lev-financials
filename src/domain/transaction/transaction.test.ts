import { describe, expect, it } from 'vitest'

import { createAccountId } from '@/domain/account'
import { createCurrency, type Currency } from '@/domain/currency'
import { createMerchantId } from '@/domain/merchant'
import { createMoney, type Money } from '@/domain/money'
import { createLocalDate, type LocalDate } from '@/domain/shared/local-date'
import { createSourceDocumentId, createSourceLocation } from '@/domain/source'
import { createStatementId } from '@/domain/statement'
import { createValidationState } from '@/domain/validation'

import { createExchangeRate } from './exchange-rate'
import { createTransaction, createTransactionId } from './transaction'

function currency(code: string): Currency {
  const result = createCurrency(code)
  if (!result.ok) throw new Error(`Expected valid synthetic currency fixture: ${code}`)
  return result.value
}

function money(minorUnits: number, valueCurrency: Currency): Money {
  const result = createMoney(minorUnits, valueCurrency)
  if (!result.ok) throw new Error(`Expected valid synthetic money fixture: ${minorUnits}`)
  return result.value
}

function date(iso: string): LocalDate {
  const result = createLocalDate(iso)
  if (!result.ok) throw new Error(`Expected valid synthetic date fixture: ${iso}`)
  return result.value
}

function transactionInput() {
  const accountId = createAccountId('account-synthetic-001')
  const id = createTransactionId('transaction-synthetic-001')
  const merchantId = createMerchantId('merchant-synthetic-001')
  const sourceDocumentId = createSourceDocumentId('source-synthetic-2026-07')
  const statementId = createStatementId('statement-synthetic-2026-07')
  const validation = createValidationState('valid')

  if (
    !accountId.ok ||
    !id.ok ||
    !merchantId.ok ||
    !sourceDocumentId.ok ||
    !statementId.ok ||
    !validation.ok
  ) {
    throw new Error('Expected valid synthetic transaction fixtures')
  }

  const source = createSourceLocation({
    documentId: sourceDocumentId.value,
    page: 2,
    recordIndex: 4,
  })
  const pln = currency('PLN')

  if (!source.ok) {
    throw new Error('Expected valid synthetic source location')
  }

  return {
    accountId: accountId.value,
    amount: money(12_50, pln),
    balanceAfter: money(500_00, pln),
    bookingDate: date('2026-07-03'),
    confidence: 'certain' as const,
    description: 'Synthetic card purchase description',
    direction: 'debit' as const,
    id: id.value,
    merchantId: merchantId.value,
    operationType: 'card_payment',
    source: source.value,
    statementId: statementId.value,
    transactionDate: date('2026-07-01'),
    validation: validation.value,
  }
}

describe('Transaction', () => {
  it('keeps booking and transaction dates distinct', () => {
    const result = createTransaction(transactionInput())

    expect(result).toEqual(expect.objectContaining({ ok: true }))
    if (result.ok) {
      expect(result.value.bookingDate.iso).toBe('2026-07-03')
      expect(result.value.transactionDate?.iso).toBe('2026-07-01')
      expect(result.value.direction).toBe('debit')
      expect(result.value.amount.minorUnits).toBe(1_250)
    }
  })

  it('models original currency and an exact settlement rate', () => {
    const input = transactionInput()
    const uah = currency('UAH')
    const rate = createExchangeRate({
      denominator: 10_000,
      fromCurrency: uah,
      numerator: 842,
      toCurrency: input.amount.currency,
    })

    if (!rate.ok) {
      throw new Error('Expected valid synthetic exchange rate')
    }

    const result = createTransaction({
      ...input,
      exchangeRate: rate.value,
      originalAmount: money(150_00, uah),
    })

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({
          exchangeRate: expect.objectContaining({ denominator: 5_000, numerator: 421 }),
          originalAmount: expect.objectContaining({ minorUnits: 15_000 }),
        }),
      }),
    )
  })

  it('requires non-negative amount because direction carries the sign', () => {
    const input = transactionInput()

    expect(
      createTransaction({
        ...input,
        amount: money(-input.amount.minorUnits, input.amount.currency),
      }),
    ).toEqual({ error: { code: 'invalid_transaction_amount', field: 'amount' }, ok: false })
  })

  it('requires running balance to use the settled currency', () => {
    expect(
      createTransaction({ ...transactionInput(), balanceAfter: money(100, currency('EUR')) }),
    ).toEqual({
      error: { code: 'transaction_currency_mismatch', field: 'balanceAfter' },
      ok: false,
    })
  })

  it('rejects an exchange rate without an original amount', () => {
    const input = transactionInput()
    const rate = createExchangeRate({
      denominator: 100,
      fromCurrency: currency('EUR'),
      numerator: 430,
      toCurrency: input.amount.currency,
    })

    if (!rate.ok) throw new Error('Expected valid synthetic exchange rate')

    expect(createTransaction({ ...input, exchangeRate: rate.value })).toEqual({
      error: { code: 'exchange_rate_requires_original_amount' },
      ok: false,
    })
  })

  it('rejects exchange-rate currencies that do not match original and settled amounts', () => {
    const input = transactionInput()
    const uah = currency('UAH')
    const eur = currency('EUR')
    const wrongFrom = createExchangeRate({
      denominator: 100,
      fromCurrency: eur,
      numerator: 430,
      toCurrency: input.amount.currency,
    })
    const wrongTo = createExchangeRate({
      denominator: 100,
      fromCurrency: uah,
      numerator: 23,
      toCurrency: eur,
    })

    if (!wrongFrom.ok || !wrongTo.ok) throw new Error('Expected valid synthetic exchange rates')

    expect(
      createTransaction({
        ...input,
        exchangeRate: wrongFrom.value,
        originalAmount: money(100, uah),
      }),
    ).toEqual({
      error: { code: 'transaction_currency_mismatch', field: 'exchangeRateFrom' },
      ok: false,
    })
    expect(
      createTransaction({
        ...input,
        exchangeRate: wrongTo.value,
        originalAmount: money(100, uah),
      }),
    ).toEqual({
      error: { code: 'transaction_currency_mismatch', field: 'exchangeRateTo' },
      ok: false,
    })
  })
})
