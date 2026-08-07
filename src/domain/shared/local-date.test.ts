import { describe, expect, it } from 'vitest'

import { compareLocalDates, createLocalDate, type LocalDate } from './local-date'

function date(iso: string): LocalDate {
  const result = createLocalDate(iso)

  if (!result.ok) {
    throw new Error(`Expected valid synthetic date fixture: ${iso}`)
  }

  return result.value
}

describe('LocalDate', () => {
  it.each(['2026-06-01', '2024-02-29', '2000-02-29'])('accepts calendar date %s', (iso) => {
    expect(createLocalDate(iso)).toEqual(expect.objectContaining({ ok: true }))
  })

  it.each(['2026-6-01', '2026-02-29', '1900-02-29', '2026-13-01', '2026-00-10', null])(
    'rejects invalid calendar date %j',
    (input) => {
      expect(createLocalDate(input)).toEqual({
        error: { code: 'invalid_local_date', received: input },
        ok: false,
      })
    },
  )

  it('orders dates without timezone conversion', () => {
    expect(compareLocalDates(date('2026-06-01'), date('2026-07-01'))).toBe(-1)
    expect(compareLocalDates(date('2026-07-01'), date('2026-07-01'))).toBe(0)
    expect(compareLocalDates(date('2026-07-31'), date('2026-07-01'))).toBe(1)
  })
})
