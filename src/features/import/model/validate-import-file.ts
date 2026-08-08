export const MAX_IMPORT_FILE_SIZE_BYTES = 25 * 1024 * 1024

export type SupportedImportFormat = 'csv' | 'pdf' | 'xlsx'

export type ImportFileValidationError =
  | Readonly<{ code: 'file_too_large'; maximumSizeBytes: number }>
  | Readonly<{ code: 'unsupported_format' }>

export type ValidatedImportFile = Readonly<{
  file: File
  format: SupportedImportFormat
}>

const formatsByExtension: Readonly<Record<string, SupportedImportFormat>> = {
  csv: 'csv',
  pdf: 'pdf',
  xlsx: 'xlsx',
}

export function validateImportFile(
  file: File,
): { ok: true; value: ValidatedImportFile } | { error: ImportFileValidationError; ok: false } {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const format = extension && formatsByExtension[extension]

  if (!format) {
    return { error: { code: 'unsupported_format' }, ok: false }
  }

  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    return {
      error: { code: 'file_too_large', maximumSizeBytes: MAX_IMPORT_FILE_SIZE_BYTES },
      ok: false,
    }
  }

  return { ok: true, value: { file, format } }
}
