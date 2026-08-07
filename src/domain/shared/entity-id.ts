import { failure, type Result, success } from './result'

const ENTITY_ID_BRAND = Symbol('EntityId')

export type EntityId<Kind extends string> = Readonly<{
  kind: Kind
  value: string
  [ENTITY_ID_BRAND]: true
}>

export type EntityIdValidationError = Readonly<{
  code: 'invalid_entity_id'
  kind: string
  received: unknown
}>

export function createEntityId<Kind extends string>(
  kind: Kind,
  input: unknown,
): Result<EntityId<Kind>, EntityIdValidationError> {
  if (typeof input !== 'string' || input.trim().length === 0) {
    return failure({ code: 'invalid_entity_id', kind, received: input })
  }

  return success(Object.freeze({ kind, value: input.trim(), [ENTITY_ID_BRAND]: true as const }))
}
