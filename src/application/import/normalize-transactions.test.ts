import { describe, expect, it } from 'vitest'

import {
  findDuplicateFingerprints,
  normalizeImportTransaction,
  normalizeText,
} from './normalize-transactions'

const candidate = {
  amountMinorUnits: -1_250,
  bookingDate: '2026-07-03',
  currency: 'PLN',
  description: '  SYNTHETIC   SHOP  ',
  operationType: 'CARD PAYMENT',
  transactionDate: '2026-07-02',
}

describe('import transaction normalization', () => {
  it('normalizes whitespace and case before creating a stable fingerprint', () => {
    expect(normalizeText(candidate.description)).toBe('synthetic shop')
    expect(normalizeImportTransaction(candidate)).toEqual(
      expect.objectContaining({ normalizedDescription: 'synthetic shop' }),
    )
    expect(normalizeImportTransaction(candidate).fingerprint).toBe(
      normalizeImportTransaction({ ...candidate, description: 'synthetic shop' }).fingerprint,
    )
  })

  it('does not treat equal amount and date as duplicates without matching context', () => {
    const fingerprint = normalizeImportTransaction(candidate).fingerprint
    expect(
      findDuplicateFingerprints(
        [{ ...candidate, description: 'another synthetic shop' }],
        new Set([fingerprint]),
      ),
    ).toEqual(new Set())
    expect(findDuplicateFingerprints([candidate], new Set([fingerprint]))).toEqual(
      new Set([fingerprint]),
    )
  })
})
