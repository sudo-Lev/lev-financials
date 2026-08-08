import type { AccountId } from '@/domain/account'
import type { CategoryId } from '@/domain/category'
import { isSameCurrency } from '@/domain/currency'
import type { MerchantId } from '@/domain/merchant'
import type { Money } from '@/domain/money'
import { createEntityId, type EntityId } from '@/domain/shared/entity-id'
import type { LocalDate } from '@/domain/shared/local-date'
import { failure, type Result, success } from '@/domain/shared/result'
import type { SourceLocation } from '@/domain/source'
import type { StatementId } from '@/domain/statement'
import type { ConfidenceLevel, ValidationState } from '@/domain/validation'

import type { ExchangeRate } from './exchange-rate'

export type TransactionId = EntityId<'transaction'>
export type TransactionDirection = 'credit' | 'debit'
export type CategoryAssignmentSource = 'manual' | 'rule'

export type Transaction = Readonly<{
  accountId: AccountId
  amount: Money
  balanceAfter?: Money
  bookingDate: LocalDate
  categoryAssignmentSource?: CategoryAssignmentSource
  categoryId?: CategoryId
  confidence: ConfidenceLevel
  description: string
  direction: TransactionDirection
  exchangeRate?: ExchangeRate
  id: TransactionId
  merchantId?: MerchantId
  operationType?: string
  originalAmount?: Money
  source: SourceLocation
  statementId: StatementId
  transactionDate: LocalDate | null
  validation: ValidationState
}>

export type TransactionValidationError =
  | Readonly<{
      code: 'invalid_transaction_amount'
      field: 'amount' | 'originalAmount'
    }>
  | Readonly<{
      code: 'invalid_transaction_field'
      field: 'description' | 'operationType'
    }>
  | Readonly<{
      code: 'transaction_currency_mismatch'
      field: 'balanceAfter' | 'exchangeRateFrom' | 'exchangeRateTo'
    }>
  | Readonly<{
      code: 'exchange_rate_requires_original_amount'
    }>
  | Readonly<{
      code: 'category_assignment_requires_category'
    }>

export function createTransactionId(input: unknown) {
  return createEntityId('transaction', input)
}

export function createTransaction(input: {
  accountId: AccountId
  amount: Money
  balanceAfter?: Money
  bookingDate: LocalDate
  categoryAssignmentSource?: CategoryAssignmentSource
  categoryId?: CategoryId
  confidence: ConfidenceLevel
  description: string
  direction: TransactionDirection
  exchangeRate?: ExchangeRate
  id: TransactionId
  merchantId?: MerchantId
  operationType?: string
  originalAmount?: Money
  source: SourceLocation
  statementId: StatementId
  transactionDate: LocalDate | null
  validation: ValidationState
}): Result<Transaction, TransactionValidationError> {
  const description = input.description.trim()
  const operationType = input.operationType?.trim()

  if (description.length === 0) {
    return failure({ code: 'invalid_transaction_field', field: 'description' })
  }

  if (operationType !== undefined && operationType.length === 0) {
    return failure({ code: 'invalid_transaction_field', field: 'operationType' })
  }

  if (input.amount.minorUnits < 0) {
    return failure({ code: 'invalid_transaction_amount', field: 'amount' })
  }

  if (input.originalAmount && input.originalAmount.minorUnits < 0) {
    return failure({ code: 'invalid_transaction_amount', field: 'originalAmount' })
  }

  if (input.categoryAssignmentSource && !input.categoryId) {
    return failure({ code: 'category_assignment_requires_category' })
  }

  if (input.balanceAfter && !isSameCurrency(input.amount.currency, input.balanceAfter.currency)) {
    return failure({ code: 'transaction_currency_mismatch', field: 'balanceAfter' })
  }

  if (input.exchangeRate && !input.originalAmount) {
    return failure({ code: 'exchange_rate_requires_original_amount' })
  }

  if (
    input.exchangeRate &&
    input.originalAmount &&
    !isSameCurrency(input.exchangeRate.fromCurrency, input.originalAmount.currency)
  ) {
    return failure({ code: 'transaction_currency_mismatch', field: 'exchangeRateFrom' })
  }

  if (input.exchangeRate && !isSameCurrency(input.exchangeRate.toCurrency, input.amount.currency)) {
    return failure({ code: 'transaction_currency_mismatch', field: 'exchangeRateTo' })
  }

  return success(
    Object.freeze({
      ...input,
      description,
      operationType,
    }),
  )
}
