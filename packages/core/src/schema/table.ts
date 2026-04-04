import type { Column } from './column'
import type { CHPrimitive } from './types'

export type TableSchema = Record<string, Column<CHPrimitive>>

export type TableConfig<T extends TableSchema> = {
  orderBy: keyof T | (keyof T)[]
  primaryKey?: keyof T | (keyof T)[]
  partitionBy?: string
}

/**
 * Table object - now extends the schema so properties are accessible
 */
export type Table<T extends TableSchema> = {
  name: string
  schema: T
  config: TableConfig<T>
} & T  // ← ADD THIS: spread schema properties onto Table

/**
 * Factory to create table
 */
export function chTable<const T extends Record<string, Column<CHPrimitive>>>(
  name: string,
  schema: T,
  config: TableConfig<T>
): Table<T> {
  const schemaWithNames = Object.fromEntries(
    Object.entries(schema).map(([key, col]) => [
      key,
      { ...col, name: key } as Column<CHPrimitive>
    ])
  ) as T

  return {
    name,
    schema: schemaWithNames,
    config,
    ...schemaWithNames  // ← ADD THIS: spread schema onto the table object
  } as Table<T>
}