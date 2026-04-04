import type { Table, TableSchema } from './table'
import {toArray} from './utils'
import { getEngineSQL } from './engine'

/**
 * Generate CREATE TABLE SQL
 */
export function generateCreateTableSQL<T extends TableSchema>(
  table: Table<T>
): string {
  const schema = table.schema
  const engine = getEngineSQL(table.config.engine)

  const columns = (Object.entries(schema) as [keyof T, T[keyof T]][])
    .map(([name, col]) => `${String(name)} ${col.type}`)
    .join(',\n  ')

  const orderBy = toArray(table.config.orderBy)
    .map(String)
    .join(', ')

  const primaryKey = table.config.primaryKey
    ? `PRIMARY KEY (${toArray(table.config.primaryKey).map(String).join(', ')})`
    : ''

  const partitionBy = table.config.partitionBy
    ? `PARTITION BY ${table.config.partitionBy}`
    : ''
  const ttl = table.config.ttl
  ? `TTL ${table.config.ttl}`
  : ''

  return `
CREATE TABLE IF NOT EXISTS ${table.name} (
  ${columns}
)
ENGINE = ${engine}
${partitionBy}
${primaryKey}
${ttl}
ORDER BY (${orderBy})
`.trim()
}