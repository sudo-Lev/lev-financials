import type { AccountId } from '@/domain/account'
import { isSameCurrency } from '@/domain/currency'
import type { Money } from '@/domain/money'
import { createEntityId, type EntityId } from '@/domain/shared/entity-id'
import { compareLocalDates, type LocalDate } from '@/domain/shared/local-date'
import { failure, type Result, success } from '@/domain/shared/result'
import type { SourceDocumentId } from '@/domain/source'
import type { ValidationState } from '@/domain/validation'

export type StatementId = EntityId<'statement'>

export type Statement = Readonly<{
  accountId: AccountId
  balances: Readonly<{
    closing: Money
    opening: Money
  }>
  id: StatementId
  period: Readonly<{
    end: LocalDate
    start: LocalDate
  }>
  reference?: string
  sourceDocumentId: SourceDocumentId
  totals: Readonly<{
    credits: Money
    debits: Money
  }>
  validation: ValidationState
}>

export type StatementValidationError =
  | Readonly<{
      code: 'invalid_statement_period'
    }>
  | Readonly<{
      code: 'invalid_statement_reference'
    }>
  | Readonly<{
      code: 'negative_statement_total'
      field: 'credits' | 'debits'
    }>
  | Readonly<{
      code: 'statement_currency_mismatch'
      field: 'closing' | 'credits' | 'debits'
    }>

export function createStatementId(input: unknown) {
  return createEntityId('statement', input)
}

export function createStatement(input: {
  accountId: AccountId
  balances: { closing: Money; opening: Money }
  id: StatementId
  period: { end: LocalDate; start: LocalDate }
  reference?: string
  sourceDocumentId: SourceDocumentId
  totals: { credits: Money; debits: Money }
  validation: ValidationState
}): Result<Statement, StatementValidationError> {
  if (compareLocalDates(input.period.start, input.period.end) === 1) {
    return failure({ code: 'invalid_statement_period' })
  }

  if (input.reference !== undefined && input.reference.trim().length === 0) {
    return failure({ code: 'invalid_statement_reference' })
  }

  for (const field of ['closing', 'credits', 'debits'] as const) {
    const money = field === 'closing' ? input.balances.closing : input.totals[field]

    if (!isSameCurrency(input.balances.opening.currency, money.currency)) {
      return failure({ code: 'statement_currency_mismatch', field })
    }
  }

  if (input.totals.credits.minorUnits < 0) {
    return failure({ code: 'negative_statement_total', field: 'credits' })
  }

  if (input.totals.debits.minorUnits < 0) {
    return failure({ code: 'negative_statement_total', field: 'debits' })
  }

  return success(
    Object.freeze({
      ...input,
      balances: Object.freeze({ ...input.balances }),
      period: Object.freeze({ ...input.period }),
      reference: input.reference?.trim(),
      totals: Object.freeze({ ...input.totals }),
    }),
  )
}
