import type { Money } from '@/domain'

export type FormatMoneyOptions = Readonly<{
  currencyDisplay?: 'code' | 'name' | 'narrowSymbol' | 'symbol'
  locale?: Intl.LocalesArgument
}>

const DEFAULT_LOCALE = 'uk-UA'

export function formatMoney(money: Money, options: FormatMoneyOptions = {}): string {
  const formatter = new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    currency: money.currency.code,
    currencyDisplay: options.currencyDisplay ?? 'symbol',
    style: 'currency',
  })
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2
  const scale = 10 ** fractionDigits
  const absoluteMinorUnits = Math.abs(money.minorUnits)
  const wholeUnits = Math.floor(absoluteMinorUnits / scale)
  const fraction = String(absoluteMinorUnits % scale).padStart(fractionDigits, '0')
  const signedWholeUnits = money.minorUnits < 0 ? -wholeUnits : wholeUnits
  const valueToFormat = money.minorUnits < 0 && wholeUnits === 0 ? -0 : signedWholeUnits

  return formatter
    .formatToParts(valueToFormat)
    .map((part) => (part.type === 'fraction' ? fraction : part.value))
    .join('')
}
