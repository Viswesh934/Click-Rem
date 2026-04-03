import type { CHPrimitive } from './types'

export type Column<T extends CHPrimitive> = {
  type: T
  name: string
}

function makeColumn<T extends CHPrimitive>(type: T) {
  return (): Column<T> => ({
    type,
    name: ''
  })
}

export const ch = {
  // base
  uuid: makeColumn('UUID'),
  string: makeColumn('String'),
  datetime: makeColumn('DateTime'),

  // 🔥 integers
  int8: makeColumn('Int8'),
  int16: makeColumn('Int16'),
  int32: makeColumn('Int32'),
  int64: makeColumn('Int64'),

  uint8: makeColumn('UInt8'),
  uint16: makeColumn('UInt16'),
  uint32: makeColumn('UInt32'),
  uint64: makeColumn('UInt64'),

  // 🔥 floats
  float32: makeColumn('Float32'),
  float64: makeColumn('Float64')
}