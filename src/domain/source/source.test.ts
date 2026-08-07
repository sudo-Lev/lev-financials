import { describe, expect, it } from 'vitest'

import { createSourceDocument, createSourceDocumentId, createSourceLocation } from './source'

function sourceDocumentId() {
  const result = createSourceDocumentId('source-synthetic-001')

  if (!result.ok) {
    throw new Error('Expected valid synthetic source document ID')
  }

  return result.value
}

describe('Source provenance', () => {
  it('creates document metadata without retaining the original file', () => {
    const result = createSourceDocument({
      fingerprint: 'A'.repeat(64),
      format: 'pdf',
      id: sourceDocumentId(),
      institutionId: 'synthetic-bank',
      parser: { id: 'synthetic.statement', version: '1.0.0' },
    })

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({ fingerprint: 'a'.repeat(64), format: 'pdf' }),
      }),
    )
  })

  it.each(['short', 'g'.repeat(64), ''])(
    'rejects invalid SHA-256 fingerprint %j',
    (fingerprint) => {
      expect(
        createSourceDocument({
          fingerprint,
          format: 'pdf',
          id: sourceDocumentId(),
          institutionId: 'synthetic-bank',
          parser: { id: 'synthetic.statement', version: '1.0.0' },
        }),
      ).toEqual({ error: { code: 'invalid_source_field', field: 'fingerprint' }, ok: false })
    },
  )

  it('tracks page and record provenance with non-negative indexes', () => {
    expect(
      createSourceLocation({ documentId: sourceDocumentId(), page: 2, recordIndex: 12 }),
    ).toEqual(expect.objectContaining({ ok: true }))
    expect(createSourceLocation({ documentId: sourceDocumentId(), page: 0 })).toEqual({
      error: { code: 'invalid_source_field', field: 'page' },
      ok: false,
    })
    expect(createSourceLocation({ documentId: sourceDocumentId(), recordIndex: -1 })).toEqual({
      error: { code: 'invalid_source_field', field: 'recordIndex' },
      ok: false,
    })
  })
})
