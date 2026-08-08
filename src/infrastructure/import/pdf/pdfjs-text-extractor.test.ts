import { describe, expect, it } from 'vitest'

import { createPdfJsTextExtractor } from './pdfjs-text-extractor'

function createSyntheticPdf(content: string): ArrayBuffer {
  const textEncoder = new TextEncoder()
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${textEncoder.encode(content).length} >>\nstream\n${content}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((object, index) => {
    offsets.push(textEncoder.encode(pdf).length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = textEncoder.encode(pdf).length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return textEncoder.encode(pdf).buffer
}

describe('PdfJsTextExtractor', () => {
  it('extracts visible PDF text with source page and coordinates', async () => {
    const extractor = createPdfJsTextExtractor()
    const result = await extractor.extract(
      createSyntheticPdf('BT\n/F1 12 Tf\n72 720 Td\n(Hello PDF) Tj\nET\n'),
    )

    expect(result).toEqual(expect.objectContaining({ ok: true }))
    if (!result.ok || result.value.status !== 'extracted')
      throw new Error('Expected extracted text')

    expect(result.value.pageCount).toBe(1)
    expect(result.value.pages[0]).toEqual(
      expect.objectContaining({
        height: 792,
        number: 1,
        text: [expect.objectContaining({ text: 'Hello PDF', x: 72, y: 720 })],
        width: 612,
      }),
    )
  })

  it('reports a PDF without a text layer without attempting OCR', async () => {
    const extractor = createPdfJsTextExtractor()
    const result = await extractor.extract(createSyntheticPdf(''))

    expect(result).toEqual({ ok: true, value: { pageCount: 1, status: 'no_text_layer' } })
  })
})
