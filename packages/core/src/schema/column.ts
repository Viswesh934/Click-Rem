import type { CHPrimitive } from './types'

export type Column<T extends CHPrimitive> = {
  type: T
}

export const ch = {
  uuid: (): Column<'UUID'> => ({ type: 'UUID' }),
  string: (): Column<'String'> => ({ type: 'String' }),
  float64: (): Column<'Float64'> => ({ type: 'Float64' }),
  datetime: (): Column<'DateTime'> => ({ type: 'DateTime' })
}