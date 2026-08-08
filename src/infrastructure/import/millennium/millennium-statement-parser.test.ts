import { describe, expect, it } from 'vitest'

import type { PdfTextFragment } from '@/application/import'

import { createMillenniumPdfStatementParser } from './millennium-statement-parser'

function fragment(text: string, x: number, y: number, index: number): PdfTextFragment {
  return { height: 10, index, text, width: 40, x, y }
}

describe('MillenniumPdfStatementParser', () => {
  it('parses statement totals and coordinate-based transactions with Polish amounts', () => {
    const parser = createMillenniumPdfStatementParser()
    const result = parser.parse({
      pageCount: 1,
      pages: [
        {
          height: 792,
          number: 1,
          width: 612,
          text: [
            fragment('Numer wyciągu: 7/2026 za okres od 01.07.2026 do 31.07.2026', 30, 730, 0),
            fragment('WALUTA: PLN', 360, 710, 1),
            fragment('SALDO POCZĄTKOWE: 1 000,00', 30, 196, 2),
            fragment('2026-07-03', 30, 155, 3),
            fragment('2026-07-02', 74, 155, 4),
            fragment('PŁATNOŚĆ KARTĄ', 124, 155, 5),
            fragment('SYNTHETIC STORE', 124, 146, 6),
            fragment('12,50-', 489, 155, 7),
            fragment('987,50', 551, 155, 8),
            fragment('SUMA UZNAŃ: 250,00', 30, 80, 9),
            fragment('SUMA OBCIĄŻEŃ: 262,50', 30, 70, 10),
            fragment('SALDO KOŃCOWE: 987,50', 30, 60, 11),
          ],
        },
      ],
      status: 'extracted',
    })

    expect(result).toEqual(expect.objectContaining({ ok: true }))
    if (!result.ok) throw new Error('Expected parsed statement')
    expect(result.value).toEqual(
      expect.objectContaining({
        closingBalance: { currency: 'PLN', minorUnits: 98_750 },
        openingBalance: { currency: 'PLN', minorUnits: 100_000 },
        period: { end: '2026-07-31', start: '2026-07-01' },
        totals: {
          credits: { currency: 'PLN', minorUnits: 25_000 },
          debits: { currency: 'PLN', minorUnits: 26_250 },
        },
        transactions: [
          expect.objectContaining({
            amount: { currency: 'PLN', minorUnits: -1_250 },
            balanceAfter: { currency: 'PLN', minorUnits: 98_750 },
            bookingDate: '2026-07-03',
            description: 'PŁATNOŚĆ KARTĄ SYNTHETIC STORE',
            transactionDate: '2026-07-02',
          }),
        ],
      }),
    )
  })

  it('rejects another PDF layout and PDFs without text', () => {
    const parser = createMillenniumPdfStatementParser()
    expect(parser.parse({ pageCount: 1, status: 'no_text_layer' })).toEqual({
      error: { code: 'unsupported_statement_format' },
      ok: false,
    })
  })
})
