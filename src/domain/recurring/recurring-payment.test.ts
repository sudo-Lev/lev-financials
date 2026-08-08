import { describe, expect, it } from 'vitest'

import { createAccountId } from '@/domain/account'
import { createCurrency } from '@/domain/currency'
import { createMoney } from '@/domain/money'
import { createLocalDate } from '@/domain/shared/local-date'
import { createValidationState } from '@/domain/validation'

import { createRecurringPayment, createRecurringPaymentId } from './recurring-payment'

function input() {
  const accountId = createAccountId('account-synthetic')
  const id = createRecurringPaymentId('recurring-synthetic')
  const validation = createValidationState('valid')
  const currency = createCurrency('PLN')
  if (!accountId.ok || !id.ok || !validation.ok || !currency.ok)
    throw new Error('Expected fixtures')
  const amount = createMoney(49_99, currency.value)
  if (!amount.ok) throw new Error('Expected money')
  return {
    accountId: accountId.value,
    cadence: 'monthly' as const,
    confidence: 'high' as const,
    evidenceTransactionIds: [],
    expectedAmount: amount.value,
    id: id.value,
    status: 'possible' as const,
    title: ' Synthetic service ',
    type: 'subscription' as const,
    validation: validation.value,
  }
}

describe('RecurringPayment', () => {
  it('models subscriptions separately from bills, tax, and transfers', () => {
    expect(createRecurringPayment(input())).toEqual(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({
          cadence: 'monthly',
          title: 'Synthetic service',
          type: 'subscription',
        }),
      }),
    )
  })

  it('rejects non-positive expected amounts and irregular forecasts', () => {
    const base = input()
    const zero = createMoney(0, base.expectedAmount.currency)
    const date = createLocalDate('2026-09-01')
    if (!zero.ok || !date.ok) throw new Error('Expected fixtures')
    expect(createRecurringPayment({ ...base, expectedAmount: zero.value })).toEqual({
      error: { code: 'invalid_recurring_amount' },
      ok: false,
    })
    expect(
      createRecurringPayment({ ...base, cadence: 'irregular', nextExpectedDate: date.value }),
    ).toEqual({ error: { code: 'recurring_date_requires_cadence' }, ok: false })
  })
})
