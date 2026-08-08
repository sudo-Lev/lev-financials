import Dexie, { type Table } from 'dexie'

import type {
  StoredAccount,
  StoredBudget,
  StoredCategory,
  StoredCategoryRule,
  StoredMerchant,
  StoredNote,
  StoredRecurringPayment,
  StoredSourceDocument,
  StoredStatement,
  StoredTag,
  StoredTransaction,
} from './records'

export const FINANCE_DATABASE_VERSION = 1

const schemaV1 = {
  accounts: '&id',
  budgets: '&id, categoryId',
  categories: '&id, parentId, state',
  categoryRules: '&id, categoryId, priority',
  merchants: '&id, normalizedName',
  notes: '&id',
  recurringPayments: '&id, accountId, categoryId, status, type',
  sourceDocuments: '&id, fingerprint, institutionId',
  statements: '&id, accountId, sourceDocumentId',
  tags: '&id, name',
  transactions: '&id, accountId, statementId, categoryId, bookingDate',
} as const

export class FinanceDatabase extends Dexie {
  readonly accounts!: Table<StoredAccount, string>
  readonly budgets!: Table<StoredBudget, string>
  readonly categories!: Table<StoredCategory, string>
  readonly categoryRules!: Table<StoredCategoryRule, string>
  readonly merchants!: Table<StoredMerchant, string>
  readonly notes!: Table<StoredNote, string>
  readonly recurringPayments!: Table<StoredRecurringPayment, string>
  readonly sourceDocuments!: Table<StoredSourceDocument, string>
  readonly statements!: Table<StoredStatement, string>
  readonly tags!: Table<StoredTag, string>
  readonly transactions!: Table<StoredTransaction, string>

  constructor(name = 'lev-financials') {
    super(name)

    this.version(FINANCE_DATABASE_VERSION).stores(schemaV1)
  }
}

export function createFinanceDatabase(name?: string): FinanceDatabase {
  return new FinanceDatabase(name)
}
