export type DateOnlyInput = string | Date | DateOnlyValue

export type GuideStageKey = '4-6' | '6-7' | '8-9' | '10-12' | '12-18' | '18-24'

export type DateOnlyValue = {
  year: number
  month: number
  day: number
}

export type CalendarAge = {
  years: number
  months: number
  days: number
  totalCompletedMonths: number
}

function isDateOnlyValue(value: DateOnlyInput): value is DateOnlyValue {
  return typeof value === 'object' && !(value instanceof Date) && value !== null && 'year' in value && 'month' in value && 'day' in value
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function compareDateOnly(left: DateOnlyValue, right: DateOnlyValue) {
  if (left.year !== right.year) {
    return left.year - right.year
  }

  if (left.month !== right.month) {
    return left.month - right.month
  }

  return left.day - right.day
}

export function parseDateOnly(value: DateOnlyInput): DateOnlyValue {
  if (isDateOnlyValue(value)) {
    return value
  }

  if (value instanceof Date) {
    return {
      year: value.getUTCFullYear(),
      month: value.getUTCMonth() + 1,
      day: value.getUTCDate()
    }
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    throw new Error('Invalid date-only value')
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (month < 1 || month > 12) {
    throw new Error('Invalid date-only month')
  }

  const maxDay = daysInMonth(year, month)
  if (day < 1 || day > maxDay) {
    throw new Error('Invalid date-only day')
  }

  return { year, month, day }
}

export function getTodayDateOnly(base = new Date()): DateOnlyValue {
  return {
    year: base.getFullYear(),
    month: base.getMonth() + 1,
    day: base.getDate()
  }
}

export function getCalendarAge(from: DateOnlyInput, to: DateOnlyInput = getTodayDateOnly()): CalendarAge {
  const start = parseDateOnly(from)
  const end = parseDateOnly(to)

  if (compareDateOnly(end, start) < 0) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalCompletedMonths: 0
    }
  }

  let years = end.year - start.year
  let months = end.month - start.month
  let days = end.day - start.day

  if (days < 0) {
    months -= 1
    const previousMonth = end.month === 1 ? 12 : end.month - 1
    const previousMonthYear = end.month === 1 ? end.year - 1 : end.year
    days += daysInMonth(previousMonthYear, previousMonth)
  }

  if (months < 0) {
    years -= 1
    months += 12
  }

  const totalCompletedMonths = Math.max(0, years * 12 + months)

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalCompletedMonths
  }
}

export function formatCalendarAgeLabel(age: CalendarAge) {
  if (age.years > 0) {
    return `${age.years}岁${age.months}个月${age.days}天`
  }

  return `${age.months}个月${age.days}天`
}

export function formatAgeLabel(from: DateOnlyInput, to: DateOnlyInput = getTodayDateOnly()) {
  return formatCalendarAgeLabel(getCalendarAge(from, to))
}

export function getGuideStageKey(totalCompletedMonths: number): GuideStageKey {
  if (totalCompletedMonths < 6) {
    return '4-6'
  }

  if (totalCompletedMonths < 8) {
    return '6-7'
  }

  if (totalCompletedMonths < 10) {
    return '8-9'
  }

  if (totalCompletedMonths < 12) {
    return '10-12'
  }

  if (totalCompletedMonths < 18) {
    return '12-18'
  }

  return '18-24'
}
