import type { PdfTextExtraction } from './pdf-text-extractor'

export type ParsedAmount = Readonly<{ currency: string; minorUnits: number }>

export type ParsedMillenniumTransaction = Readonly<{
  amount: ParsedAmount
  balanceAfter?: ParsedAmount
  bookingDate: string
  description: string
  exchangeRate?: Readonly<{ fromCurrency: string; rate: string; toCurrency: string }>
  operationType: string
  originalAmount?: ParsedAmount
  sourcePage: number
  transactionDate: string
}>

export type ParsedMillenniumStatement = Readonly<{
  closingBalance: ParsedAmount
  currency: string
  openingBalance: ParsedAmount
  period: Readonly<{ end: string; start: string }>
  totals: Readonly<{ credits: ParsedAmount; debits: ParsedAmount }>
  transactions: readonly ParsedMillenniumTransaction[]
}>

export type MillenniumStatementParseResult =
  | Readonly<{ ok: true; value: ParsedMillenniumStatement }>
  | Readonly<{
      error: Readonly<{
        code: 'missing_required_field' | 'unsupported_statement_format'
        field?: string
      }>
      ok: false
    }>

export interface MillenniumStatementParser {
  parse(extraction: PdfTextExtraction): MillenniumStatementParseResult
}
