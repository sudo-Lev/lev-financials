export type PdfTextFragment = Readonly<{
  height: number
  index: number
  text: string
  width: number
  x: number
  y: number
}>

export type PdfTextPage = Readonly<{
  height: number
  number: number
  text: readonly PdfTextFragment[]
  width: number
}>

export type PdfTextExtraction =
  | Readonly<{
      pageCount: number
      pages: readonly PdfTextPage[]
      status: 'extracted'
    }>
  | Readonly<{
      pageCount: number
      status: 'no_text_layer'
    }>

export type PdfTextExtractionError = Readonly<{
  code: 'invalid_pdf' | 'password_protected' | 'unexpected_pdf_error'
}>

export type PdfTextExtractionResult =
  | Readonly<{ ok: true; value: PdfTextExtraction }>
  | Readonly<{ error: PdfTextExtractionError; ok: false }>

export interface PdfTextExtractor {
  extract(pdfData: ArrayBuffer): Promise<PdfTextExtractionResult>
}
