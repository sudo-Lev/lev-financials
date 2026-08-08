import { describe, expect, it } from 'vitest'

import { createCurrency } from '@/domain/currency'
import { createMoney } from '@/domain/money'

import {
  createBudget,
  createBudgetId,
  createCategory,
  createCategoryId,
  createCategoryRule,
  createCategoryRuleId,
  createNote,
  createNoteId,
  createTag,
  createTagId,
} from './category'

function categoryId(value: string) {
  const result = createCategoryId(value)
  if (!result.ok) throw new Error('Expected synthetic category id')
  return result.value
}

describe('Category domain', () => {
  it('keeps analytics kinds explicit and prevents self-parenting', () => {
    const id = categoryId('category-food')
    expect(createCategory({ id, kind: 'consumption', name: ' Food ', state: 'active' })).toEqual(
      expect.objectContaining({ ok: true, value: expect.objectContaining({ name: 'Food' }) }),
    )
    expect(
      createCategory({ id, kind: 'consumption', name: 'Food', parentId: id, state: 'active' }),
    ).toEqual({ error: { code: 'self_referencing_category' }, ok: false })
  })

  it('requires deterministic rules to have a criterion and valid priority', () => {
    const ruleId = createCategoryRuleId('rule-food')
    if (!ruleId.ok) throw new Error('Expected synthetic rule id')
    const base = { categoryId: categoryId('category-food'), id: ruleId.value, priority: 10 }
    expect(createCategoryRule({ ...base, criteria: {} })).toEqual({
      error: { code: 'category_rule_requires_criterion' },
      ok: false,
    })
    expect(
      createCategoryRule({ ...base, criteria: { descriptionIncludes: 'market' }, priority: -1 }),
    ).toEqual({ error: { code: 'invalid_category_rule_priority' }, ok: false })
    expect(createCategoryRule({ ...base, criteria: { descriptionIncludes: ' market ' } })).toEqual(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({
          criteria: expect.objectContaining({ descriptionIncludes: 'market' }),
        }),
      }),
    )
  })

  it('validates tags, notes, and positive monthly budgets', () => {
    const tagId = createTagId('tag-home')
    const noteId = createNoteId('note-001')
    const budgetId = createBudgetId('budget-food')
    const currency = createCurrency('PLN')
    if (!tagId.ok || !noteId.ok || !budgetId.ok || !currency.ok)
      throw new Error('Expected synthetic fixtures')
    const zero = createMoney(0, currency.value)
    const limit = createMoney(100_00, currency.value)
    if (!zero.ok || !limit.ok) throw new Error('Expected synthetic money')
    expect(createTag({ id: tagId.value, name: ' Home ' })).toEqual(
      expect.objectContaining({ ok: true, value: { id: tagId.value, name: 'Home' } }),
    )
    expect(createNote({ id: noteId.value, text: ' ' })).toEqual({
      error: { code: 'invalid_category_field', field: 'noteText' },
      ok: false,
    })
    expect(
      createBudget({
        categoryId: categoryId('category-food'),
        id: budgetId.value,
        monthlyLimit: zero.value,
      }),
    ).toEqual({ error: { code: 'invalid_budget_limit' }, ok: false })
    expect(
      createBudget({
        categoryId: categoryId('category-food'),
        id: budgetId.value,
        monthlyLimit: limit.value,
      }),
    ).toEqual(expect.objectContaining({ ok: true }))
  })
})
