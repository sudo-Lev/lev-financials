import { describe, expect, it } from 'vitest'

import { MAX_IMPORT_FILE_SIZE_BYTES, validateImportFile } from './validate-import-file'

describe('validateImportFile', () => {
  it('accepts local PDF, XLSX, and CSV statements by filename extension', () => {
    expect(validateImportFile(new File(['content'], 'statement.PDF'))).toEqual(
      expect.objectContaining({ ok: true, value: expect.objectContaining({ format: 'pdf' }) }),
    )
    expect(validateImportFile(new File(['content'], 'statement.xlsx'))).toEqual(
      expect.objectContaining({ ok: true, value: expect.objectContaining({ format: 'xlsx' }) }),
    )
    expect(validateImportFile(new File(['content'], 'statement.csv'))).toEqual(
      expect.objectContaining({ ok: true, value: expect.objectContaining({ format: 'csv' }) }),
    )
  })

  it('rejects unsupported extensions and files over the local intake limit', () => {
    expect(validateImportFile(new File(['content'], 'statement.txt'))).toEqual({
      error: { code: 'unsupported_format' },
      ok: false,
    })
    expect(
      validateImportFile(
        new File([new Uint8Array(MAX_IMPORT_FILE_SIZE_BYTES + 1)], 'statement.pdf'),
      ),
    ).toEqual({
      error: { code: 'file_too_large', maximumSizeBytes: MAX_IMPORT_FILE_SIZE_BYTES },
      ok: false,
    })
  })
})
