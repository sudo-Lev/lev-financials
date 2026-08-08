import {
  createAccount,
  createAccountId,
  createBudget,
  createBudgetId,
  createCategory,
  createCategoryId,
  createCategoryRule,
  createCategoryRuleId,
  createCurrency,
  createExchangeRate,
  createMerchant,
  createMerchantId,
  createMoney,
  createNote,
  createNoteId,
  createRecurringPayment,
  createRecurringPaymentId,
  createSourceDocument,
  createSourceDocumentId,
  createSourceLocation,
  createStatement,
  createStatementId,
  createTag,
  createTagId,
  createTransaction,
  createTransactionId,
  createValidationState,
  type Account,
  type Budget,
  type Category,
  type CategoryRule,
  type Merchant,
  type Money,
  type Note,
  type RecurringPayment,
  type SourceDocument,
  type Statement,
  type Tag,
  type Transaction,
  type ValidationState,
} from '@/domain'
import { createLocalDate } from '@/domain/shared/local-date'

type StoredMoney = Readonly<{ currencyCode: string; minorUnits: number }>
type StoredValidation = Readonly<{
  issues: readonly { code: string; field?: string }[]
  status: ValidationState['status']
}>

export type StoredAccount = Readonly<{
  currencyCode: string
  displayName: string
  id: string
  identifier: Account['identifier']
  institution: Account['institution']
}>

export type StoredMerchant = Readonly<{
  confidence: Merchant['confidence']
  displayName: string
  id: string
  normalizedName: string
}>

export type StoredSourceDocument = Readonly<{
  fingerprint: string
  format: SourceDocument['format']
  id: string
  institutionId: string
  parser: SourceDocument['parser']
}>

export type StoredStatement = Readonly<{
  accountId: string
  balances: Readonly<{ closing: StoredMoney; opening: StoredMoney }>
  id: string
  period: Readonly<{ end: string; start: string }>
  reference?: string
  sourceDocumentId: string
  totals: Readonly<{ credits: StoredMoney; debits: StoredMoney }>
  validation: StoredValidation
}>

export type StoredTransaction = Readonly<{
  accountId: string
  amount: StoredMoney
  balanceAfter?: StoredMoney
  bookingDate: string
  categoryAssignmentSource?: Transaction['categoryAssignmentSource']
  categoryId?: string
  confidence: Transaction['confidence']
  description: string
  direction: Transaction['direction']
  exchangeRate?: Readonly<{
    denominator: number
    fromCurrencyCode: string
    numerator: number
    toCurrencyCode: string
  }>
  id: string
  merchantId?: string
  operationType?: string
  originalAmount?: StoredMoney
  source: Readonly<{ documentId: string; page?: number; recordIndex?: number }>
  statementId: string
  transactionDate: string | null
  validation: StoredValidation
}>

export type StoredCategory = Readonly<{
  id: string
  kind: Category['kind']
  name: string
  parentId?: string
  state: Category['state']
}>

export type StoredCategoryRule = Readonly<{
  categoryId: string
  criteria: Readonly<{
    descriptionIncludes?: string
    direction?: CategoryRule['criteria']['direction']
    merchantId?: string
    operationType?: string
  }>
  id: string
  priority: number
}>

export type StoredTag = Readonly<{ id: string; name: string }>
export type StoredNote = Readonly<{ id: string; text: string }>
export type StoredBudget = Readonly<{ categoryId: string; id: string; monthlyLimit: StoredMoney }>

export type StoredRecurringPayment = Readonly<{
  accountId: string
  cadence: RecurringPayment['cadence']
  categoryId?: string
  confidence: RecurringPayment['confidence']
  evidenceTransactionIds: readonly string[]
  expectedAmount?: StoredMoney
  id: string
  merchantId?: string
  nextExpectedDate?: string
  status: RecurringPayment['status']
  title: string
  type: RecurringPayment['type']
  validation: StoredValidation
}>

export class StoredEntityValidationError extends Error {
  readonly entity: string

  constructor(entity: string) {
    super(`Could not restore valid ${entity} data from local storage`)
    this.entity = entity
    this.name = 'StoredEntityValidationError'
  }
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: This is the established Result-unwrapping helper for codec construction.
function valueOf<ResultValue>(
  result: { ok: true; value: ResultValue } | { ok: false },
  entity: string,
): ResultValue {
  if (!result.ok) throw new StoredEntityValidationError(entity)
  return result.value
}

function toStoredMoney(money: Money): StoredMoney {
  return { currencyCode: money.currency.code, minorUnits: money.minorUnits }
}

function fromStoredMoney(money: StoredMoney): Money {
  return valueOf(
    createMoney(money.minorUnits, valueOf(createCurrency(money.currencyCode), 'currency')),
    'money',
  )
}

function toStoredValidation(validation: ValidationState): StoredValidation {
  return { issues: validation.issues, status: validation.status }
}

function fromStoredValidation(validation: StoredValidation): ValidationState {
  if (validation.status === 'invalid' || validation.status === 'warning') {
    return valueOf(createValidationState(validation.status, validation.issues), 'validation state')
  }
  return valueOf(createValidationState(validation.status), 'validation state')
}

function optionalValue<Value>(
  value: string | undefined,
  create: (input: string) => { ok: true; value: Value } | { ok: false },
  entity: string,
): Value | undefined {
  return value === undefined ? undefined : valueOf(create(value), entity)
}

export const accountRecord = {
  fromStored(record: StoredAccount): Account {
    return valueOf(
      createAccount({
        currency: valueOf(createCurrency(record.currencyCode), 'account'),
        displayName: record.displayName,
        id: valueOf(createAccountId(record.id), 'account'),
        identifier: record.identifier,
        institution: record.institution,
      }),
      'account',
    )
  },
  toStored(entity: Account): StoredAccount {
    return { ...entity, currencyCode: entity.currency.code, id: entity.id.value }
  },
}

export const merchantRecord = {
  fromStored(record: StoredMerchant): Merchant {
    return valueOf(
      createMerchant({ ...record, id: valueOf(createMerchantId(record.id), 'merchant') }),
      'merchant',
    )
  },
  toStored(entity: Merchant): StoredMerchant {
    return { ...entity, id: entity.id.value }
  },
}

export const sourceDocumentRecord = {
  fromStored(record: StoredSourceDocument): SourceDocument {
    return valueOf(
      createSourceDocument({
        ...record,
        id: valueOf(createSourceDocumentId(record.id), 'source document'),
      }),
      'source document',
    )
  },
  toStored(entity: SourceDocument): StoredSourceDocument {
    return { ...entity, id: entity.id.value }
  },
}

export const statementRecord = {
  fromStored(record: StoredStatement): Statement {
    return valueOf(
      createStatement({
        accountId: valueOf(createAccountId(record.accountId), 'statement'),
        balances: {
          closing: fromStoredMoney(record.balances.closing),
          opening: fromStoredMoney(record.balances.opening),
        },
        id: valueOf(createStatementId(record.id), 'statement'),
        period: {
          end: valueOf(createLocalDate(record.period.end), 'statement'),
          start: valueOf(createLocalDate(record.period.start), 'statement'),
        },
        reference: record.reference,
        sourceDocumentId: valueOf(createSourceDocumentId(record.sourceDocumentId), 'statement'),
        totals: {
          credits: fromStoredMoney(record.totals.credits),
          debits: fromStoredMoney(record.totals.debits),
        },
        validation: fromStoredValidation(record.validation),
      }),
      'statement',
    )
  },
  toStored(entity: Statement): StoredStatement {
    return {
      accountId: entity.accountId.value,
      balances: {
        closing: toStoredMoney(entity.balances.closing),
        opening: toStoredMoney(entity.balances.opening),
      },
      id: entity.id.value,
      period: { end: entity.period.end.iso, start: entity.period.start.iso },
      reference: entity.reference,
      sourceDocumentId: entity.sourceDocumentId.value,
      totals: {
        credits: toStoredMoney(entity.totals.credits),
        debits: toStoredMoney(entity.totals.debits),
      },
      validation: toStoredValidation(entity.validation),
    }
  },
}

export const transactionRecord = {
  fromStored(record: StoredTransaction): Transaction {
    const exchangeRate = record.exchangeRate
      ? valueOf(
          createExchangeRate({
            denominator: record.exchangeRate.denominator,
            fromCurrency: valueOf(
              createCurrency(record.exchangeRate.fromCurrencyCode),
              'transaction',
            ),
            numerator: record.exchangeRate.numerator,
            toCurrency: valueOf(createCurrency(record.exchangeRate.toCurrencyCode), 'transaction'),
          }),
          'transaction',
        )
      : undefined
    const source = valueOf(
      createSourceLocation({
        documentId: valueOf(createSourceDocumentId(record.source.documentId), 'transaction'),
        page: record.source.page,
        recordIndex: record.source.recordIndex,
      }),
      'transaction',
    )
    return valueOf(
      createTransaction({
        accountId: valueOf(createAccountId(record.accountId), 'transaction'),
        amount: fromStoredMoney(record.amount),
        balanceAfter: record.balanceAfter && fromStoredMoney(record.balanceAfter),
        bookingDate: valueOf(createLocalDate(record.bookingDate), 'transaction'),
        categoryAssignmentSource: record.categoryAssignmentSource,
        categoryId: optionalValue(record.categoryId, createCategoryId, 'transaction'),
        confidence: record.confidence,
        description: record.description,
        direction: record.direction,
        exchangeRate,
        id: valueOf(createTransactionId(record.id), 'transaction'),
        merchantId: optionalValue(record.merchantId, createMerchantId, 'transaction'),
        operationType: record.operationType,
        originalAmount: record.originalAmount && fromStoredMoney(record.originalAmount),
        source,
        statementId: valueOf(createStatementId(record.statementId), 'transaction'),
        transactionDate:
          record.transactionDate === null
            ? null
            : valueOf(createLocalDate(record.transactionDate), 'transaction'),
        validation: fromStoredValidation(record.validation),
      }),
      'transaction',
    )
  },
  toStored(entity: Transaction): StoredTransaction {
    return {
      accountId: entity.accountId.value,
      amount: toStoredMoney(entity.amount),
      balanceAfter: entity.balanceAfter && toStoredMoney(entity.balanceAfter),
      bookingDate: entity.bookingDate.iso,
      categoryAssignmentSource: entity.categoryAssignmentSource,
      categoryId: entity.categoryId?.value,
      confidence: entity.confidence,
      description: entity.description,
      direction: entity.direction,
      exchangeRate: entity.exchangeRate && {
        denominator: entity.exchangeRate.denominator,
        fromCurrencyCode: entity.exchangeRate.fromCurrency.code,
        numerator: entity.exchangeRate.numerator,
        toCurrencyCode: entity.exchangeRate.toCurrency.code,
      },
      id: entity.id.value,
      merchantId: entity.merchantId?.value,
      operationType: entity.operationType,
      originalAmount: entity.originalAmount && toStoredMoney(entity.originalAmount),
      source: {
        documentId: entity.source.documentId.value,
        page: entity.source.page,
        recordIndex: entity.source.recordIndex,
      },
      statementId: entity.statementId.value,
      transactionDate: entity.transactionDate?.iso ?? null,
      validation: toStoredValidation(entity.validation),
    }
  },
}

export const categoryRecord = {
  fromStored(record: StoredCategory): Category {
    return valueOf(
      createCategory({
        ...record,
        id: valueOf(createCategoryId(record.id), 'category'),
        parentId: optionalValue(record.parentId, createCategoryId, 'category'),
      }),
      'category',
    )
  },
  toStored(entity: Category): StoredCategory {
    return { ...entity, id: entity.id.value, parentId: entity.parentId?.value }
  },
}

export const categoryRuleRecord = {
  fromStored(record: StoredCategoryRule): CategoryRule {
    return valueOf(
      createCategoryRule({
        categoryId: valueOf(createCategoryId(record.categoryId), 'category rule'),
        criteria: {
          ...record.criteria,
          merchantId: optionalValue(record.criteria.merchantId, createMerchantId, 'category rule'),
        },
        id: valueOf(createCategoryRuleId(record.id), 'category rule'),
        priority: record.priority,
      }),
      'category rule',
    )
  },
  toStored(entity: CategoryRule): StoredCategoryRule {
    return {
      categoryId: entity.categoryId.value,
      criteria: { ...entity.criteria, merchantId: entity.criteria.merchantId?.value },
      id: entity.id.value,
      priority: entity.priority,
    }
  },
}

export const tagRecord = {
  fromStored(record: StoredTag): Tag {
    return valueOf(createTag({ ...record, id: valueOf(createTagId(record.id), 'tag') }), 'tag')
  },
  toStored(entity: Tag): StoredTag {
    return { ...entity, id: entity.id.value }
  },
}

export const noteRecord = {
  fromStored(record: StoredNote): Note {
    return valueOf(createNote({ ...record, id: valueOf(createNoteId(record.id), 'note') }), 'note')
  },
  toStored(entity: Note): StoredNote {
    return { ...entity, id: entity.id.value }
  },
}

export const budgetRecord = {
  fromStored(record: StoredBudget): Budget {
    return valueOf(
      createBudget({
        categoryId: valueOf(createCategoryId(record.categoryId), 'budget'),
        id: valueOf(createBudgetId(record.id), 'budget'),
        monthlyLimit: fromStoredMoney(record.monthlyLimit),
      }),
      'budget',
    )
  },
  toStored(entity: Budget): StoredBudget {
    return {
      categoryId: entity.categoryId.value,
      id: entity.id.value,
      monthlyLimit: toStoredMoney(entity.monthlyLimit),
    }
  },
}

export const recurringPaymentRecord = {
  fromStored(record: StoredRecurringPayment): RecurringPayment {
    return valueOf(
      createRecurringPayment({
        accountId: valueOf(createAccountId(record.accountId), 'recurring payment'),
        cadence: record.cadence,
        categoryId: optionalValue(record.categoryId, createCategoryId, 'recurring payment'),
        confidence: record.confidence,
        evidenceTransactionIds: record.evidenceTransactionIds.map((id) =>
          valueOf(createTransactionId(id), 'recurring payment'),
        ),
        expectedAmount: record.expectedAmount && fromStoredMoney(record.expectedAmount),
        id: valueOf(createRecurringPaymentId(record.id), 'recurring payment'),
        merchantId: optionalValue(record.merchantId, createMerchantId, 'recurring payment'),
        nextExpectedDate: optionalValue(
          record.nextExpectedDate,
          createLocalDate,
          'recurring payment',
        ),
        status: record.status,
        title: record.title,
        type: record.type,
        validation: fromStoredValidation(record.validation),
      }),
      'recurring payment',
    )
  },
  toStored(entity: RecurringPayment): StoredRecurringPayment {
    return {
      accountId: entity.accountId.value,
      cadence: entity.cadence,
      categoryId: entity.categoryId?.value,
      confidence: entity.confidence,
      evidenceTransactionIds: entity.evidenceTransactionIds.map((id) => id.value),
      expectedAmount: entity.expectedAmount && toStoredMoney(entity.expectedAmount),
      id: entity.id.value,
      merchantId: entity.merchantId?.value,
      nextExpectedDate: entity.nextExpectedDate?.iso,
      status: entity.status,
      title: entity.title,
      type: entity.type,
      validation: toStoredValidation(entity.validation),
    }
  },
}
