import { describe, expect, it } from 'vitest'

import { reconcileStatement } from './reconcile-statement'

const statement = {
  closingBalance: { currency: 'PLN', minorUnits: 900 },
  currency: 'PLN',
  openingBalance: { currency: 'PLN', minorUnits: 1_000 },
  period: { end: '2026-07-31', start: '2026-07-01' },
  totals: {
    credits: { currency: 'PLN', minorUnits: 100 },
    debits: { currency: 'PLN', minorUnits: 200 },
  },
  transactions: [
    {
      amount: { currency: 'PLN', minorUnits: -200 },
      bookingDate: '2026-07-03',
      description: 'Synthetic',
      operationType: 'card',
      sourcePage: 1,
      transactionDate: '2026-07-02',
      balanceAfter: { currency: 'PLN', minorUnits: 800 },
    },
    {
      amount: { currency: 'PLN', minorUnits: 100 },
      bookingDate: '2026-07-04',
      description: 'Synthetic',
      operationType: 'transfer',
      sourcePage: 1,
      transactionDate: '2026-07-04',
      balanceAfter: { currency: 'PLN', minorUnits: 900 },
    },
  ],
} as const

describe('reconcileStatement', () => {
  it('accepts matching statement totals and running balances', () => {
    expect(reconcileStatement(statement)).toEqual({ isBalanced: true, issues: [] })
  })

  it('reports explicit warnings for totals and running-balance mismatches', () => {
    expect(
      reconcileStatement({
        ...statement,
        closingBalance: { currency: 'PLN', minorUnits: 901 },
        transactions: [
          { ...statement.transactions[0], balanceAfter: { currency: 'PLN', minorUnits: 799 } },
        ],
      }),
    ).toEqual({
      isBalanced: false,
      issues: [
        { code: 'closing_balance_mismatch' },
        { code: 'running_balance_mismatch', transactionIndex: 0 },
      ],
    })
  })
})
