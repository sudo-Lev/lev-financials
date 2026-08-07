import { createEntityId, type EntityId } from '@/domain/shared/entity-id'
import { failure, type Result, success } from '@/domain/shared/result'
import type { ConfidenceLevel } from '@/domain/validation'

export type MerchantId = EntityId<'merchant'>

export type Merchant = Readonly<{
  confidence: ConfidenceLevel
  displayName: string
  id: MerchantId
  normalizedName: string
}>

export type MerchantValidationError = Readonly<{
  code: 'invalid_merchant_field'
  field: 'displayName' | 'normalizedName'
}>

export function createMerchantId(input: unknown) {
  return createEntityId('merchant', input)
}

export function createMerchant(input: {
  confidence: ConfidenceLevel
  displayName: string
  id: MerchantId
  normalizedName: string
}): Result<Merchant, MerchantValidationError> {
  const displayName = input.displayName.trim()
  const normalizedName = input.normalizedName.trim()

  if (displayName.length === 0) {
    return failure({ code: 'invalid_merchant_field', field: 'displayName' })
  }

  if (normalizedName.length === 0) {
    return failure({ code: 'invalid_merchant_field', field: 'normalizedName' })
  }

  return success(Object.freeze({ ...input, displayName, normalizedName }))
}
