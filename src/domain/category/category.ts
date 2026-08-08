import type { MerchantId } from '@/domain/merchant'
import type { Money } from '@/domain/money'
import { createEntityId, type EntityId } from '@/domain/shared/entity-id'
import { failure, type Result, success } from '@/domain/shared/result'
import type { TransactionDirection } from '@/domain/transaction'

export type CategoryId = EntityId<'category'>
export type CategoryKind = 'cash' | 'consumption' | 'income' | 'tax' | 'transfer'
export type CategoryState = 'active' | 'archived'
export type CategoryRuleId = EntityId<'category-rule'>
export type TagId = EntityId<'tag'>
export type NoteId = EntityId<'note'>
export type BudgetId = EntityId<'budget'>

export type Category = Readonly<{
  id: CategoryId
  kind: CategoryKind
  name: string
  parentId?: CategoryId
  state: CategoryState
}>

export type CategoryRule = Readonly<{
  categoryId: CategoryId
  criteria: Readonly<{
    descriptionIncludes?: string
    direction?: TransactionDirection
    merchantId?: MerchantId
    operationType?: string
  }>
  id: CategoryRuleId
  priority: number
}>

export type Tag = Readonly<{ id: TagId; name: string }>
export type Note = Readonly<{ id: NoteId; text: string }>
export type Budget = Readonly<{
  categoryId: CategoryId
  id: BudgetId
  monthlyLimit: Money
}>

export type CategoryValidationError = Readonly<{
  code:
    | 'category_rule_requires_criterion'
    | 'invalid_category_field'
    | 'invalid_category_rule_priority'
    | 'invalid_budget_limit'
    | 'self_referencing_category'
  field?: string
}>

export function createCategoryId(input: unknown) {
  return createEntityId('category', input)
}

export function createCategoryRuleId(input: unknown) {
  return createEntityId('category-rule', input)
}

export function createTagId(input: unknown) {
  return createEntityId('tag', input)
}

export function createNoteId(input: unknown) {
  return createEntityId('note', input)
}

export function createBudgetId(input: unknown) {
  return createEntityId('budget', input)
}

export function createCategory(input: {
  id: CategoryId
  kind: CategoryKind
  name: string
  parentId?: CategoryId
  state: CategoryState
}): Result<Category, CategoryValidationError> {
  const name = input.name.trim()
  if (name.length === 0) return failure({ code: 'invalid_category_field', field: 'name' })
  if (input.parentId?.value === input.id.value)
    return failure({ code: 'self_referencing_category' })

  return success(Object.freeze({ ...input, name }))
}

export function createCategoryRule(input: {
  categoryId: CategoryId
  criteria: CategoryRule['criteria']
  id: CategoryRuleId
  priority: number
}): Result<CategoryRule, CategoryValidationError> {
  const descriptionIncludes = input.criteria.descriptionIncludes?.trim()
  const operationType = input.criteria.operationType?.trim()
  const criteria = {
    ...input.criteria,
    descriptionIncludes,
    operationType,
  }

  if (!Number.isSafeInteger(input.priority) || input.priority < 0) {
    return failure({ code: 'invalid_category_rule_priority' })
  }
  if (
    !criteria.descriptionIncludes &&
    !criteria.direction &&
    !criteria.merchantId &&
    !criteria.operationType
  ) {
    return failure({ code: 'category_rule_requires_criterion' })
  }

  return success(Object.freeze({ ...input, criteria: Object.freeze(criteria) }))
}

export function createTag(input: {
  id: TagId
  name: string
}): Result<Tag, CategoryValidationError> {
  const name = input.name.trim()
  if (name.length === 0) return failure({ code: 'invalid_category_field', field: 'tagName' })
  return success(Object.freeze({ ...input, name }))
}

export function createNote(input: {
  id: NoteId
  text: string
}): Result<Note, CategoryValidationError> {
  const text = input.text.trim()
  if (text.length === 0) return failure({ code: 'invalid_category_field', field: 'noteText' })
  return success(Object.freeze({ ...input, text }))
}

export function createBudget(input: {
  categoryId: CategoryId
  id: BudgetId
  monthlyLimit: Money
}): Result<Budget, CategoryValidationError> {
  if (input.monthlyLimit.minorUnits <= 0) return failure({ code: 'invalid_budget_limit' })
  return success(Object.freeze({ ...input }))
}
