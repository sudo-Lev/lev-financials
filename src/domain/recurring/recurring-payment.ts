import type { AccountId } from '@/domain/account'
import type { CategoryId } from '@/domain/category'
import type { MerchantId } from '@/domain/merchant'
import type { Money } from '@/domain/money'
import { createEntityId, type EntityId } from '@/domain/shared/entity-id'
import type { LocalDate } from '@/domain/shared/local-date'
import { failure, type Result, success } from '@/domain/shared/result'
import type { TransactionId } from '@/domain/transaction'
import type { ConfidenceLevel, ValidationState } from '@/domain/validation'

export type RecurringPaymentId = EntityId<'recurring-payment'>
export type RecurringPaymentType = 'bill' | 'subscription' | 'tax' | 'transfer'
export type RecurringPaymentStatus = 'active' | 'cancelled' | 'ignored' | 'possible'
export type RecurrenceCadence = 'irregular' | 'monthly' | 'quarterly' | 'weekly' | 'yearly'

export type RecurringPayment = Readonly<{
  accountId: AccountId
  cadence: RecurrenceCadence
  categoryId?: CategoryId
  confidence: ConfidenceLevel
  evidenceTransactionIds: readonly TransactionId[]
  expectedAmount?: Money
  id: RecurringPaymentId
  merchantId?: MerchantId
  nextExpectedDate?: LocalDate
  status: RecurringPaymentStatus
  title: string
  type: RecurringPaymentType
  validation: ValidationState
}>

export type RecurringPaymentValidationError = Readonly<{
  code: 'invalid_recurring_amount' | 'invalid_recurring_title' | 'recurring_date_requires_cadence'
}>

export function createRecurringPaymentId(input: unknown) {
  return createEntityId('recurring-payment', input)
}

export function createRecurringPayment(input: {
  accountId: AccountId
  cadence: RecurrenceCadence
  categoryId?: CategoryId
  confidence: ConfidenceLevel
  evidenceTransactionIds: readonly TransactionId[]
  expectedAmount?: Money
  id: RecurringPaymentId
  merchantId?: MerchantId
  nextExpectedDate?: LocalDate
  status: RecurringPaymentStatus
  title: string
  type: RecurringPaymentType
  validation: ValidationState
}): Result<RecurringPayment, RecurringPaymentValidationError> {
  const title = input.title.trim()
  if (title.length === 0) return failure({ code: 'invalid_recurring_title' })
  if (input.expectedAmount && input.expectedAmount.minorUnits <= 0) {
    return failure({ code: 'invalid_recurring_amount' })
  }
  if (input.nextExpectedDate && input.cadence === 'irregular') {
    return failure({ code: 'recurring_date_requires_cadence' })
  }

  return success(
    Object.freeze({
      ...input,
      evidenceTransactionIds: Object.freeze([...input.evidenceTransactionIds]),
      title,
    }),
  )
}
