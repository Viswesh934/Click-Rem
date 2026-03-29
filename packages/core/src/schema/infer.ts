import type { CHToTS } from './types'
import type { TableSchema } from './table'

export type Infer<T extends { schema: TableSchema }> = {
  [K in keyof T['schema']]: CHToTS<T['schema'][K]['type']>
}