import type { EntityRepository, FinanceRepositories } from '@/application/storage'
import type { EntityId } from '@/domain/shared/entity-id'

import type { FinanceDatabase } from './finance-database'
import {
  accountRecord,
  budgetRecord,
  categoryRecord,
  categoryRuleRecord,
  merchantRecord,
  noteRecord,
  recurringPaymentRecord,
  sourceDocumentRecord,
  statementRecord,
  tagRecord,
  transactionRecord,
} from './records'

type StoredEntity = Readonly<{ id: string }>

type RecordMapper<Entity, Stored extends StoredEntity> = Readonly<{
  fromStored(record: Stored): Entity
  toStored(entity: Entity): Stored
}>

class IndexedDbEntityRepository<Entity, Id extends EntityId<string>, Stored extends StoredEntity>
  implements EntityRepository<Entity, Id>
{
  private readonly mapper: RecordMapper<Entity, Stored>
  private readonly table: {
    delete(id: string): Promise<unknown>
    get(id: string): Promise<Stored | undefined>
    put(value: Stored): Promise<unknown>
    toArray(): Promise<Stored[]>
  }

  constructor(
    table: {
      delete(id: string): Promise<unknown>
      get(id: string): Promise<Stored | undefined>
      put(value: Stored): Promise<unknown>
      toArray(): Promise<Stored[]>
    },
    mapper: RecordMapper<Entity, Stored>,
  ) {
    this.table = table
    this.mapper = mapper
  }

  async delete(id: Id): Promise<void> {
    await this.table.delete(id.value)
  }

  async findById(id: Id): Promise<Entity | undefined> {
    const record = await this.table.get(id.value)
    return record && this.mapper.fromStored(record)
  }

  async list(): Promise<readonly Entity[]> {
    return (await this.table.toArray()).map((record) => this.mapper.fromStored(record))
  }

  async save(entity: Entity): Promise<void> {
    await this.table.put(this.mapper.toStored(entity))
  }
}

export function createIndexedDbFinanceRepositories(database: FinanceDatabase): FinanceRepositories {
  return {
    accounts: new IndexedDbEntityRepository(database.accounts, accountRecord),
    budgets: new IndexedDbEntityRepository(database.budgets, budgetRecord),
    categories: new IndexedDbEntityRepository(database.categories, categoryRecord),
    categoryRules: new IndexedDbEntityRepository(database.categoryRules, categoryRuleRecord),
    merchants: new IndexedDbEntityRepository(database.merchants, merchantRecord),
    notes: new IndexedDbEntityRepository(database.notes, noteRecord),
    recurringPayments: new IndexedDbEntityRepository(
      database.recurringPayments,
      recurringPaymentRecord,
    ),
    sourceDocuments: new IndexedDbEntityRepository(database.sourceDocuments, sourceDocumentRecord),
    statements: new IndexedDbEntityRepository(database.statements, statementRecord),
    tags: new IndexedDbEntityRepository(database.tags, tagRecord),
    transactions: new IndexedDbEntityRepository(database.transactions, transactionRecord),
  }
}
