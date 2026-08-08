import type {
  Account,
  AccountId,
  Budget,
  BudgetId,
  Category,
  CategoryId,
  CategoryRule,
  CategoryRuleId,
  Merchant,
  MerchantId,
  Note,
  NoteId,
  RecurringPayment,
  RecurringPaymentId,
  SourceDocument,
  SourceDocumentId,
  Statement,
  StatementId,
  Tag,
  TagId,
  Transaction,
  TransactionId,
} from '@/domain'
import type { EntityId } from '@/domain/shared/entity-id'

export interface EntityRepository<Entity, Id extends EntityId<string>> {
  delete(id: Id): Promise<void>
  findById(id: Id): Promise<Entity | undefined>
  list(): Promise<readonly Entity[]>
  save(entity: Entity): Promise<void>
}

export interface FinanceRepositories {
  accounts: EntityRepository<Account, AccountId>
  budgets: EntityRepository<Budget, BudgetId>
  categories: EntityRepository<Category, CategoryId>
  categoryRules: EntityRepository<CategoryRule, CategoryRuleId>
  merchants: EntityRepository<Merchant, MerchantId>
  notes: EntityRepository<Note, NoteId>
  recurringPayments: EntityRepository<RecurringPayment, RecurringPaymentId>
  sourceDocuments: EntityRepository<SourceDocument, SourceDocumentId>
  statements: EntityRepository<Statement, StatementId>
  tags: EntityRepository<Tag, TagId>
  transactions: EntityRepository<Transaction, TransactionId>
}
