import { describe, expect, it } from 'vitest'

import { createEntityId } from './entity-id'

describe('EntityId', () => {
  it('creates an immutable, scoped identifier', () => {
    const result = createEntityId('transaction', ' txn-synthetic-001 ')

    expect(result).toEqual(expect.objectContaining({ ok: true }))
    if (result.ok) {
      expect(result.value).toEqual(
        expect.objectContaining({ kind: 'transaction', value: 'txn-synthetic-001' }),
      )
      expect(Object.isFrozen(result.value)).toBe(true)
    }
  })

  it.each(['', '   ', null, 12])('rejects invalid identifier %j', (input) => {
    expect(createEntityId('account', input)).toEqual({
      error: { code: 'invalid_entity_id', kind: 'account', received: input },
      ok: false,
    })
  })
})
