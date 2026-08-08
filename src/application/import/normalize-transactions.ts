export type ImportTransactionCandidate = Readonly<{
  amountMinorUnits: number
  bookingDate: string
  currency: string
  description: string
  operationType: string
  transactionDate: string
}>

export type NormalizedImportTransaction = Readonly<{
  fingerprint: string
  merchantName: string
  normalizedDescription: string
}>

export function normalizeImportTransaction(
  candidate: ImportTransactionCandidate,
): NormalizedImportTransaction {
  const normalizedDescription = normalizeText(candidate.description)
  const merchantName = normalizedDescription.split(' ')[0] ?? normalizedDescription
  return {
    fingerprint: createStableFingerprint([
      candidate.bookingDate,
      candidate.transactionDate,
      candidate.currency,
      String(candidate.amountMinorUnits),
      normalizeText(candidate.operationType),
      normalizedDescription,
    ]),
    merchantName,
    normalizedDescription,
  }
}

export function findDuplicateFingerprints(
  candidates: readonly ImportTransactionCandidate[],
  existingFingerprints: ReadonlySet<string>,
): ReadonlySet<string> {
  return new Set(
    candidates
      .map((candidate) => normalizeImportTransaction(candidate).fingerprint)
      .filter((fingerprint) => existingFingerprints.has(fingerprint)),
  )
}

export function normalizeText(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('uk-UA').replace(/\s+/g, ' ').trim()
}

function createStableFingerprint(parts: readonly string[]): string {
  let hash = 0x811c9dc5
  for (const character of parts.join('\u001f')) {
    hash ^= character.codePointAt(0) ?? 0
    hash = Math.imul(hash, 0x01000193)
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`
}
