import 'fake-indexeddb/auto'

import { afterEach, describe, expect, it } from 'vitest'

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
} from '@/domain'
import { createLocalDate } from '@/domain/shared/local-date'
import type { Result } from '@/domain/shared/result'

import {
  createFinanceDatabase,
  createIndexedDbFinanceRepositories,
  FINANCE_DATABASE_VERSION,
} from '.'

const databaseNames: string[] = []

afterEach(async () => {
  await Promise.all(
    databaseNames.splice(0).map(async (name) => {
      const database = createFinanceDatabase(name)
      await database.delete()
    }),
  )
})

// biome-ignore lint/suspicious/noShadowRestrictedNames: Test fixtures unwrap the project Result type in a compact, explicit way.
function valueOf<Value>(result: Result<Value, unknown>): Value {
  if (!result.ok) throw new Error('Expected valid synthetic fixture')
  return result.value
}

function createFixtures() {
  const currency = valueOf(createCurrency('PLN'))
  const validation = valueOf(createValidationState('valid'))
  const account = valueOf(
    createAccount({
      currency,
      displayName: 'Synthetic personal account',
      id: valueOf(createAccountId('account-storage-001')),
      identifier: { scheme: 'custom', value: 'SYNTHETIC-001' },
      institution: { id: 'synthetic-bank', name: 'Synthetic Bank' },
    }),
  )
  const sourceDocument = valueOf(
    createSourceDocument({
      fingerprint: 'a'.repeat(64),
      format: 'pdf',
      id: valueOf(createSourceDocumentId('source-storage-001')),
      institutionId: account.institution.id,
      parser: { id: 'synthetic-parser', version: '1.0.0' },
    }),
  )
  const merchant = valueOf(
    createMerchant({
      confidence: 'certain',
      displayName: 'Synthetic Store',
      id: valueOf(createMerchantId('merchant-storage-001')),
      normalizedName: 'synthetic store',
    }),
  )
  const statement = valueOf(
    createStatement({
      accountId: account.id,
      balances: {
        closing: valueOf(createMoney(900_00, currency)),
        opening: valueOf(createMoney(1_000_00, currency)),
      },
      id: valueOf(createStatementId('statement-storage-001')),
      period: {
        end: valueOf(createLocalDate('2026-07-31')),
        start: valueOf(createLocalDate('2026-07-01')),
      },
      sourceDocumentId: sourceDocument.id,
      totals: {
        credits: valueOf(createMoney(0, currency)),
        debits: valueOf(createMoney(100_00, currency)),
      },
      validation,
    }),
  )
  const category = valueOf(
    createCategory({
      id: valueOf(createCategoryId('category-storage-001')),
      kind: 'consumption',
      name: 'Food',
      state: 'active',
    }),
  )
  const categoryRule = valueOf(
    createCategoryRule({
      categoryId: category.id,
      criteria: { merchantId: merchant.id },
      id: valueOf(createCategoryRuleId('category-rule-storage-001')),
      priority: 100,
    }),
  )
  const tag = valueOf(createTag({ id: valueOf(createTagId('tag-storage-001')), name: 'Synthetic' }))
  const note = valueOf(
    createNote({ id: valueOf(createNoteId('note-storage-001')), text: 'Synthetic note' }),
  )
  const budget = valueOf(
    createBudget({
      categoryId: category.id,
      id: valueOf(createBudgetId('budget-storage-001')),
      monthlyLimit: valueOf(createMoney(500_00, currency)),
    }),
  )
  const transaction = valueOf(
    createTransaction({
      accountId: account.id,
      amount: valueOf(createMoney(100_00, currency)),
      bookingDate: valueOf(createLocalDate('2026-07-05')),
      categoryAssignmentSource: 'rule',
      categoryId: category.id,
      confidence: 'certain',
      description: 'Synthetic food purchase',
      direction: 'debit',
      id: valueOf(createTransactionId('transaction-storage-001')),
      merchantId: merchant.id,
      source: valueOf(
        createSourceLocation({ documentId: sourceDocument.id, page: 1, recordIndex: 0 }),
      ),
      statementId: statement.id,
      transactionDate: valueOf(createLocalDate('2026-07-04')),
      validation,
    }),
  )
  const recurringPayment = valueOf(
    createRecurringPayment({
      accountId: account.id,
      cadence: 'monthly',
      categoryId: category.id,
      confidence: 'high',
      evidenceTransactionIds: [transaction.id],
      expectedAmount: valueOf(createMoney(100_00, currency)),
      id: valueOf(createRecurringPaymentId('recurring-storage-001')),
      status: 'possible',
      title: 'Synthetic monthly groceries',
      type: 'subscription',
      validation,
    }),
  )

  return {
    account,
    budget,
    category,
    categoryRule,
    merchant,
    note,
    recurringPayment,
    sourceDocument,
    statement,
    tag,
    transaction,
  }
}

describe('IndexedDB finance repositories', () => {
  it('stores and restores valid domain entities after a database reload', async () => {
    const name = `lev-financials-test-${crypto.randomUUID()}`
    databaseNames.push(name)
    const fixtures = createFixtures()
    const initialDatabase = createFinanceDatabase(name)
    const initialRepositories = createIndexedDbFinanceRepositories(initialDatabase)

    await initialRepositories.accounts.save(fixtures.account)
    await initialRepositories.budgets.save(fixtures.budget)
    await initialRepositories.categories.save(fixtures.category)
    await initialRepositories.categoryRules.save(fixtures.categoryRule)
    await initialRepositories.merchants.save(fixtures.merchant)
    await initialRepositories.notes.save(fixtures.note)
    await initialRepositories.sourceDocuments.save(fixtures.sourceDocument)
    await initialRepositories.statements.save(fixtures.statement)
    await initialRepositories.tags.save(fixtures.tag)
    await initialRepositories.transactions.save(fixtures.transaction)
    await initialRepositories.recurringPayments.save(fixtures.recurringPayment)
    initialDatabase.close()

    const reloadedDatabase = createFinanceDatabase(name)
    const reloadedRepositories = createIndexedDbFinanceRepositories(reloadedDatabase)
    const restoredTransaction = await reloadedRepositories.transactions.findById(
      fixtures.transaction.id,
    )
    const restoredRecurring = await reloadedRepositories.recurringPayments.findById(
      fixtures.recurringPayment.id,
    )

    expect(reloadedDatabase.verno).toBe(FINANCE_DATABASE_VERSION)
    expect(await reloadedRepositories.accounts.findById(fixtures.account.id)).toEqual(
      fixtures.account,
    )
    expect(await reloadedRepositories.budgets.list()).toEqual([fixtures.budget])
    expect(await reloadedRepositories.categories.list()).toEqual([fixtures.category])
    expect(await reloadedRepositories.categoryRules.list()).toEqual([fixtures.categoryRule])
    expect(await reloadedRepositories.merchants.list()).toEqual([fixtures.merchant])
    expect(await reloadedRepositories.notes.list()).toEqual([fixtures.note])
    expect(restoredTransaction).toEqual(fixtures.transaction)
    expect(restoredRecurring).toEqual(fixtures.recurringPayment)
    expect(await reloadedRepositories.sourceDocuments.list()).toEqual([fixtures.sourceDocument])
    expect(await reloadedRepositories.statements.list()).toEqual([fixtures.statement])
    expect(await reloadedRepositories.tags.list()).toEqual([fixtures.tag])
    expect(restoredTransaction?.amount.minorUnits).toBe(10_000)
    expect(restoredTransaction?.transactionDate?.iso).toBe('2026-07-04')

    reloadedDatabase.close()
  })
})
