import { formatDateTime } from '../schema/utils'

export function buildWhere(where?: Record<string, any>): string {
  if (!where) return ''

  const conditions: string[] = []

  for (const [key, value] of Object.entries(where)) {
    if (value === undefined) continue

    if (typeof value !== 'object' || value instanceof Date) {
      conditions.push(`${key} = ${formatValue(value)}`)
      continue
    }

    if (value.eq !== undefined) {
      conditions.push(`${key} = ${formatValue(value.eq)}`)
    }
    if (value.gt !== undefined) {
      conditions.push(`${key} > ${formatValue(value.gt)}`)
    }
    if (value.gte !== undefined) {
      conditions.push(`${key} >= ${formatValue(value.gte)}`)
    }
    if (value.lt !== undefined) {
      conditions.push(`${key} < ${formatValue(value.lt)}`)
    }
    if (value.lte !== undefined) {
      conditions.push(`${key} <= ${formatValue(value.lte)}`)
    }
    if (value.in !== undefined) {
      const vals = value.in.map(formatValue).join(', ')
      conditions.push(`${key} IN (${vals})`)
    }
  }

  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
}

function formatValue(val: unknown): string {
  if (val instanceof Date) {
    return `'${formatDateTime(val)}'`
  }
  if (typeof val === 'string') {
    return `'${val}'`
  }
  return String(val)
}