import type {
  MillenniumStatementParser,
  MillenniumStatementParseResult,
  ParsedAmount,
  ParsedMillenniumTransaction,
  PdfTextExtraction,
  PdfTextFragment,
} from '@/application/import'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const POLISH_AMOUNT_PATTERN = /([\d\s.]+,\d{2})(-?)/

export class MillenniumPdfStatementParser implements MillenniumStatementParser {
  parse(extraction: PdfTextExtraction): MillenniumStatementParseResult {
    if (extraction.status !== 'extracted') {
      return { error: { code: 'unsupported_statement_format' }, ok: false }
    }

    const allText = extraction.pages
      .flatMap((page) => page.text.map((fragment) => fragment.text))
      .join(' ')
    if (!allText.includes('Numer wyciągu:') || !allText.includes('SALDO POCZĄTKOWE:')) {
      return { error: { code: 'unsupported_statement_format' }, ok: false }
    }

    const period = matchPeriod(allText)
    const currency = matchCurrency(allText)
    if (!period || !currency) {
      return { error: { code: 'missing_required_field' }, ok: false }
    }
    const openingBalance = matchLabeledAmount(allText, 'SALDO POCZĄTKOWE:', currency)
    const closingBalance = matchLabeledAmount(allText, 'SALDO KOŃCOWE:', currency)
    const credits = matchLabeledAmount(allText, 'SUMA UZNAŃ:', currency)
    const debits = matchLabeledAmount(allText, 'SUMA OBCIĄŻEŃ:', currency)

    if (!openingBalance || !closingBalance || !credits || !debits) {
      return { error: { code: 'missing_required_field' }, ok: false }
    }

    return {
      ok: true,
      value: Object.freeze({
        closingBalance,
        currency,
        openingBalance,
        period: Object.freeze(period),
        totals: Object.freeze({ credits, debits }),
        transactions: Object.freeze(
          extraction.pages.flatMap((page) => parsePage(page.number, page.text, currency)),
        ),
      }),
    }
  }
}

export function createMillenniumPdfStatementParser(): MillenniumStatementParser {
  return new MillenniumPdfStatementParser()
}

function matchPeriod(text: string): { end: string; start: string } | undefined {
  const match = /za okres od (\d{2}\.\d{2}\.\d{4}) do (\d{2}\.\d{2}\.\d{4})/.exec(text)
  return match ? { end: toIsoDate(match[2]), start: toIsoDate(match[1]) } : undefined
}

function matchCurrency(text: string): string | undefined {
  return /WALUTA:\s*([A-Z]{3})/.exec(text)?.[1]
}

function matchLabeledAmount(
  text: string,
  label: string,
  currency: string,
): ParsedAmount | undefined {
  const position = text.lastIndexOf(label)
  if (position < 0) return undefined
  return parseAmount(text.slice(position + label.length, position + label.length + 32), currency)
}

function parsePage(
  page: number,
  fragments: readonly PdfTextFragment[],
  currency: string,
): ParsedMillenniumTransaction[] {
  const visual = [...fragments].sort((left, right) => right.y - left.y || left.x - right.x)
  const rows: PdfTextFragment[][] = []
  let current: PdfTextFragment[] | undefined

  for (let index = 0; index < visual.length; index += 1) {
    const fragment = visual[index]
    const next = visual[index + 1]
    const beginsRow =
      fragment.x < 65 &&
      DATE_PATTERN.test(fragment.text) &&
      next !== undefined &&
      next.x >= 65 &&
      next.x < 115 &&
      Math.abs(next.y - fragment.y) < 3 &&
      DATE_PATTERN.test(next.text)

    if (beginsRow) {
      current = [fragment, next]
      rows.push(current)
      index += 1
    } else if (current) {
      current.push(fragment)
    }
  }

  return rows.flatMap((row) => toTransaction(row, page, currency))
}

function toTransaction(
  row: readonly PdfTextFragment[],
  sourcePage: number,
  currency: string,
): ParsedMillenniumTransaction[] {
  const bookingDate = row[0]?.text
  const transactionDate = row[1]?.text
  if (!bookingDate || !transactionDate) return []
  const amount = parseAmount(
    row.find((fragment) => fragment.x >= 470 && fragment.x < 540)?.text ?? '',
    currency,
  )
  if (!amount) return []
  const balanceAfter = parseAmount(row.find((fragment) => fragment.x >= 540)?.text ?? '', currency)
  const descriptionParts = row
    .filter((fragment) => fragment.x >= 110 && fragment.x < 470)
    .map((fragment) => fragment.text)
  const firstLine = descriptionParts[0]?.trim() ?? ''
  const foreignAmountLine = descriptionParts.find((part) => part.startsWith('Kwota transakcji:'))
  const description = descriptionParts
    .filter((part) => !part.startsWith('Kwota transakcji:'))
    .join(' ')
    .trim()
  if (!description) return []

  const originalAmount = foreignAmountLine ? parseOriginalAmount(foreignAmountLine) : undefined
  const exchangeRate = foreignAmountLine
    ? parseExchangeRate(foreignAmountLine, currency)
    : undefined

  return [
    Object.freeze({
      amount,
      balanceAfter,
      bookingDate,
      description,
      exchangeRate,
      operationType: firstLine,
      originalAmount,
      sourcePage,
      transactionDate,
    }),
  ]
}

function parseOriginalAmount(value: string): ParsedAmount | undefined {
  const match = /Kwota transakcji:\s*([\d.,]+)\s+([A-Z]{3})/.exec(value)
  return match
    ? parseAmount(match[1].includes(',') ? match[1] : match[1].replace('.', ','), match[2])
    : undefined
}

function parseExchangeRate(value: string, settledCurrency: string) {
  const match = /Kurs walutowy:\s*1\s+([A-Z]{3})\s*=\s*([\d.,]+)\s+([A-Z]{3})/.exec(value)
  if (!match) return undefined
  return Object.freeze({
    fromCurrency: match[1],
    rate: match[2],
    toCurrency: match[3] ?? settledCurrency,
  })
}

function parseAmount(value: string, currency: string): ParsedAmount | undefined {
  const match = POLISH_AMOUNT_PATTERN.exec(value.replace(/\u00a0/g, ' '))
  if (!match) return undefined
  const normalized = match[1].replace(/[\s.]/g, '').replace(',', '.')
  const minorUnits = Math.round(Number(normalized) * 100)
  if (!Number.isSafeInteger(minorUnits)) return undefined
  return Object.freeze({ currency, minorUnits: match[2] === '-' ? -minorUnits : minorUnits })
}

function toIsoDate(value: string): string {
  const [day, month, year] = value.split('.')
  return `${year}-${month}-${day}`
}
