import type { Column } from './column'
import type { CHPrimitive } from './types'

/**
 * Base schema definition
 */
export type TableSchema = Record<string, Column<CHPrimitive>>

/**
 * Table configuration (typed against schema keys)
 */
export type TableConfig<T extends TableSchema> = {
  orderBy: keyof T | (keyof T)[]
  primaryKey?: keyof T | (keyof T)[]
  partitionBy?: string
}

/**
 * Table object
 */
export type Table<T extends TableSchema> = {
  name: string
  schema: T
  config: TableConfig<T>
}

/**
 * Factory to create table
 */
export function chTable<T extends TableSchema>(
  name: string,
  schema: T,
  config: TableConfig<T>
): Table<T> {
  return {
    name,
    schema,
    config
  }
}