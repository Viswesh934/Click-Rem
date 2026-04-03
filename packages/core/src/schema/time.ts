import type { FilterOps } from './filters'

type TimeUnit = 'days' | 'weeks' | 'months' | 'years'

function now(): Date {
  return new Date()
}

function shift(date: Date, amount: number, unit: TimeUnit): Date {
  const d = new Date(date)

  switch (unit) {
    case 'days':
      d.setDate(d.getDate() + amount)
      break
    case 'weeks':
      d.setDate(d.getDate() + amount * 7)
      break
    case 'months':
      d.setMonth(d.getMonth() + amount)
      break
    case 'years':
      d.setFullYear(d.getFullYear() + amount)
      break
  }

  return d
}

function startOf(unit: TimeUnit): Date {
  const d = new Date()

  if (unit === 'days') {
    d.setHours(0, 0, 0, 0)
  }

  if (unit === 'weeks') {
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
  }

  if (unit === 'months') {
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
  }

  if (unit === 'years') {
    d.setMonth(0, 1)
    d.setHours(0, 0, 0, 0)
  }

  return d
}

/**
 * Last N units
 */
export function last(amount: number, unit: TimeUnit): FilterOps<Date> {
  return {
    gte: shift(now(), -amount, unit)
  }
}

/**
 * This unit (week/month/year)
 */
export function thisPeriod(unit: TimeUnit): FilterOps<Date> {
  return {
    gte: startOf(unit),
    lte: now()
  }
}

export function last7Days() {
  return last(7, 'days')
}

export function last30Days() {
  return last(30, 'days')
}

export function thisMonth() {
  return thisPeriod('months')
}

export function thisWeek() {
  return thisPeriod('weeks')
}

export function before(date: Date): FilterOps<Date> {
  return { lt: date }
}

export function after(date: Date): FilterOps<Date> {
  return { gt: date }
}

export function between(start: Date, end: Date): FilterOps<Date> {
  return {
    gte: start,
    lte: end
  }
}