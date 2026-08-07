import { describe, expect, it } from 'vitest'

import { createMerchant, createMerchantId } from './merchant'

function merchantId() {
  const result = createMerchantId('merchant-synthetic-001')

  if (!result.ok) {
    throw new Error('Expected valid synthetic merchant ID')
  }

  return result.value
}

describe('Merchant', () => {
  it('keeps source-facing and normalized names separate', () => {
    expect(
      createMerchant({
        confidence: 'high',
        displayName: 'Example Market City',
        id: merchantId(),
        normalizedName: 'example market',
      }),
    ).toEqual(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({
          displayName: 'Example Market City',
          normalizedName: 'example market',
        }),
      }),
    )
  })

  it.each(['displayName', 'normalizedName'] as const)('rejects blank %s', (field) => {
    expect(
      createMerchant({
        confidence: 'unknown',
        displayName: field === 'displayName' ? '' : 'Example',
        id: merchantId(),
        normalizedName: field === 'normalizedName' ? '' : 'example',
      }),
    ).toEqual({ error: { code: 'invalid_merchant_field', field }, ok: false })
  })
})
