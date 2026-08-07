import { failure, type Result, success } from './result'

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const LOCAL_DATE_BRAND = Symbol('LocalDate')

export type LocalDate = Readonly<{
  iso: string
  [LOCAL_DATE_BRAND]: true
}>

export type LocalDateValidationError = Readonly<{
  code: 'invalid_local_date'
  received: unknown
}>

export function createLocalDate(input: unknown): Result<LocalDate, LocalDateValidationError> {
  if (typeof input !== 'string') {
    return failure({ code: 'invalid_local_date', received: input })
  }

  const match = LOCAL_DATE_PATTERN.exec(input)

  if (!match) {
    return failure({ code: 'invalid_local_date', received: input })
  }

  const [, yearPart, monthPart, dayPart] = match
  const year = Number(yearPart)
  const month = Number(monthPart)
  const day = Number(dayPart)

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return failure({ code: 'invalid_local_date', received: input })
  }

  return success(Object.freeze({ iso: input, [LOCAL_DATE_BRAND]: true as const }))
}

export function compareLocalDates(left: LocalDate, right: LocalDate): -1 | 0 | 1 {
  if (left.iso === right.iso) {
    return 0
  }

  return left.iso < right.iso ? -1 : 1
}

function daysInMonth(year: number, month: number): number {
  const monthLengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return monthLengths[month - 1] ?? 0
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}
