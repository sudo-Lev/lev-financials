import { describe, expect, it } from 'vitest'

import { createValidationState } from './validation'

describe('ValidationState', () => {
  it.each(['pending', 'valid'] as const)('creates %s state without issues', (status) => {
    expect(createValidationState(status)).toEqual({
      ok: true,
      value: { issues: [], status },
    })
  })

  it.each(['warning', 'invalid'] as const)('requires issues for %s state', (status) => {
    expect(createValidationState(status, [])).toEqual({
      error: { code: 'validation_issues_required', status },
      ok: false,
    })
  })

  it('preserves machine-readable issues', () => {
    expect(
      createValidationState('warning', [{ code: 'missing_exchange_rate', field: 'exchangeRate' }]),
    ).toEqual({
      ok: true,
      value: {
        issues: [{ code: 'missing_exchange_rate', field: 'exchangeRate' }],
        status: 'warning',
      },
    })
  })
})
