import { describe, expect, it } from 'vitest'

import { createCurrency } from '@/domain/currency'

import { createAccount, createAccountId } from './account'

function accountInput() {
  const id = createAccountId('account-synthetic-001')
  const currency = createCurrency('PLN')

  if (!id.ok || !currency.ok) {
    throw new Error('Expected valid synthetic account fixtures')
  }

  return {
    currency: currency.value,
    displayName: 'Everyday account',
    id: id.value,
    identifier: { scheme: 'iban' as const, value: 'PL00000000000000000000000000' },
    institution: { id: 'synthetic-bank-pl', name: 'Synthetic Bank' },
  }
}

describe('Account', () => {
  it('models an account independently from its statements', () => {
    const result = createAccount(accountInput())

    expect(result).toEqual(expect.objectContaining({ ok: true }))
    if (result.ok) {
      expect(result.value.currency.code).toBe('PLN')
      expect(result.value.identifier.scheme).toBe('iban')
      expect(Object.isFrozen(result.value)).toBe(true)
    }
  })

  it.each([
    ['displayName', { displayName: ' ' }],
    ['identifier', { identifier: { scheme: 'iban' as const, value: '' } }],
    ['institutionId', { institution: { id: '', name: 'Synthetic Bank' } }],
    ['institutionName', { institution: { id: 'synthetic-bank-pl', name: '' } }],
  ] as const)('rejects blank %s', (field, override) => {
    expect(createAccount({ ...accountInput(), ...override })).toEqual({
      error: { code: 'invalid_account_field', field },
      ok: false,
    })
  })
})
