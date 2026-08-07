import type { Currency } from '@/domain/currency'
import { createEntityId, type EntityId } from '@/domain/shared/entity-id'
import { failure, type Result, success } from '@/domain/shared/result'

export type AccountId = EntityId<'account'>
export type AccountIdentifierScheme = 'custom' | 'iban' | 'local'

export type Account = Readonly<{
  currency: Currency
  displayName: string
  id: AccountId
  identifier: Readonly<{
    scheme: AccountIdentifierScheme
    value: string
  }>
  institution: Readonly<{
    id: string
    name: string
  }>
}>

export type AccountValidationError = Readonly<{
  code: 'invalid_account_field'
  field: 'displayName' | 'identifier' | 'institutionId' | 'institutionName'
}>

export function createAccountId(input: unknown) {
  return createEntityId('account', input)
}

export function createAccount(input: {
  currency: Currency
  displayName: string
  id: AccountId
  identifier: { scheme: AccountIdentifierScheme; value: string }
  institution: { id: string; name: string }
}): Result<Account, AccountValidationError> {
  const displayName = input.displayName.trim()
  const identifier = input.identifier.value.trim()
  const institutionId = input.institution.id.trim()
  const institutionName = input.institution.name.trim()

  if (displayName.length === 0) {
    return failure({ code: 'invalid_account_field', field: 'displayName' })
  }

  if (identifier.length === 0) {
    return failure({ code: 'invalid_account_field', field: 'identifier' })
  }

  if (institutionId.length === 0) {
    return failure({ code: 'invalid_account_field', field: 'institutionId' })
  }

  if (institutionName.length === 0) {
    return failure({ code: 'invalid_account_field', field: 'institutionName' })
  }

  return success(
    Object.freeze({
      currency: input.currency,
      displayName,
      id: input.id,
      identifier: Object.freeze({ scheme: input.identifier.scheme, value: identifier }),
      institution: Object.freeze({ id: institutionId, name: institutionName }),
    }),
  )
}
