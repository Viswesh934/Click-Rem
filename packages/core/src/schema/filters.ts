import type { Column } from './column'
import type { CHPrimitive } from './types'
import type { TableSchema } from './table'

/**
 * Map ClickHouse → TypeScript
 */
export type CHToTS<T extends CHPrimitive> =
  T extends 'String' ? string :
  T extends 'UUID' ? string :
  T extends 'DateTime' ? Date :
  number

/**
 * Operators
 */
export type FilterOps<T> = {
  eq?: T
  gt?: T
  gte?: T
  lt?: T
  lte?: T
  in?: T[]
}

/**
 * Where clause (FIXED)
 */
export type Where<TSchema extends TableSchema> = {
  [K in keyof TSchema]?:
    | CHToTS<TSchema[K] extends Column<infer U> ? U : never>
    | FilterOps<CHToTS<TSchema[K] extends Column<infer U> ? U : never>>
}