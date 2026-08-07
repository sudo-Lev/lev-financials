import { describe, expect, it } from 'vitest'

import { createAccountId } from '@/domain/account'
import { createCurrency, type Currency } from '@/domain/currency'
import { createMoney, type Money } from '@/domain/money'
import { createLocalDate, type LocalDate } from '@/domain/shared/local-date'
import { createSourceDocumentId } from '@/domain/source'
import { createValidationState } from '@/domain/validation'

import { createStatement, createStatementId } from './statement'

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

function statementInput() {
  const accountId = createAccountId('account-synthetic-001')
  const id = createStatementId('statement-synthetic-2026-07')
  const sourceDocumentId = createSourceDocumentId('source-synthetic-2026-07')
  const validation = createValidationState('valid')
  const pln = currency('PLN')

  if (!accountId.ok || !id.ok || !sourceDocumentId.ok || !validation.ok) {
    throw new Error('Expected valid synthetic statement fixtures')
  }

  return {
    accountId: accountId.value,
    balances: { closing: money(150_00, pln), opening: money(775_00, pln) },
    id: id.value,
    period: { end: date('2026-07-31'), start: date('2026-07-01') },
    reference: 'synthetic-7-2026',
    sourceDocumentId: sourceDocumentId.value,
    totals: { credits: money(24_300_00, pln), debits: money(24_925_00, pln) },
    validation: validation.value,
  }
}

describe('Statement', () => {
  it('models one account section within a source document', () => {
    const result = createStatement(statementInput())

    expect(result).toEqual(expect.objectContaining({ ok: true }))
    if (result.ok) {
      expect(result.value.period.start.iso).toBe('2026-07-01')
      expect(result.value.balances.opening.currency.code).toBe('PLN')
      expect(Object.isFrozen(result.value)).toBe(true)
    }
  })

  it('rejects an inverted statement period', () => {
    expect(
      createStatement({
        ...statementInput(),
        period: { end: date('2026-07-01'), start: date('2026-07-31') },
      }),
    ).toEqual({ error: { code: 'invalid_statement_period' }, ok: false })
  })

  it('requires balances and totals to use one statement currency', () => {
    const input = statementInput()

    expect(
      createStatement({
        ...input,
        balances: { ...input.balances, closing: money(150_00, currency('UAH')) },
      }),
    ).toEqual({
      error: { code: 'statement_currency_mismatch', field: 'closing' },
      ok: false,
    })
  })

  it.each(['credits', 'debits'] as const)('rejects negative %s total', (field) => {
    const input = statementInput()

    expect(
      createStatement({
        ...input,
        totals: { ...input.totals, [field]: money(-1, input.balances.opening.currency) },
      }),
    ).toEqual({ error: { code: 'negative_statement_total', field }, ok: false })
  })
})
