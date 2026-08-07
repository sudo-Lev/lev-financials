import { createEntityId, type EntityId } from '@/domain/shared/entity-id'
import { failure, type Result, success } from '@/domain/shared/result'

export type SourceDocumentId = EntityId<'source-document'>
export type SourceFormat = 'csv' | 'pdf' | 'xlsx'

export type SourceDocument = Readonly<{
  fingerprint: string
  format: SourceFormat
  id: SourceDocumentId
  institutionId: string
  parser: Readonly<{
    id: string
    version: string
  }>
}>

export type SourceLocation = Readonly<{
  documentId: SourceDocumentId
  page?: number
  recordIndex?: number
}>

export type SourceValidationError = Readonly<{
  code: 'invalid_source_field'
  field: 'fingerprint' | 'institutionId' | 'page' | 'parserId' | 'parserVersion' | 'recordIndex'
}>

const SHA_256_PATTERN = /^[a-f0-9]{64}$/

export function createSourceDocumentId(input: unknown) {
  return createEntityId('source-document', input)
}

export function createSourceDocument(input: {
  fingerprint: string
  format: SourceFormat
  id: SourceDocumentId
  institutionId: string
  parser: { id: string; version: string }
}): Result<SourceDocument, SourceValidationError> {
  const fingerprint = input.fingerprint.trim().toLowerCase()

  if (!SHA_256_PATTERN.test(fingerprint)) {
    return failure({ code: 'invalid_source_field', field: 'fingerprint' })
  }

  const institutionId = input.institutionId.trim()
  const parserId = input.parser.id.trim()
  const parserVersion = input.parser.version.trim()

  if (institutionId.length === 0) {
    return failure({ code: 'invalid_source_field', field: 'institutionId' })
  }

  if (parserId.length === 0) {
    return failure({ code: 'invalid_source_field', field: 'parserId' })
  }

  if (parserVersion.length === 0) {
    return failure({ code: 'invalid_source_field', field: 'parserVersion' })
  }

  return success(
    Object.freeze({
      fingerprint,
      format: input.format,
      id: input.id,
      institutionId,
      parser: Object.freeze({ id: parserId, version: parserVersion }),
    }),
  )
}

export function createSourceLocation(input: {
  documentId: SourceDocumentId
  page?: number
  recordIndex?: number
}): Result<SourceLocation, SourceValidationError> {
  if (input.page !== undefined && (!Number.isSafeInteger(input.page) || input.page < 1)) {
    return failure({ code: 'invalid_source_field', field: 'page' })
  }

  if (
    input.recordIndex !== undefined &&
    (!Number.isSafeInteger(input.recordIndex) || input.recordIndex < 0)
  ) {
    return failure({ code: 'invalid_source_field', field: 'recordIndex' })
  }

  return success(Object.freeze({ ...input }))
}
