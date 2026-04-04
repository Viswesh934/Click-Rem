export type Engine =
  | 'MergeTree'
  | 'ReplacingMergeTree'
  | 'SummingMergeTree'

export type EngineConfig =
  | { type: 'MergeTree' }
  | { type: 'ReplacingMergeTree'; versionColumn?: string }
  | { type: 'SummingMergeTree'; columns?: string[] }

export type CHPrimitive =
  | 'UUID'
  | 'String'
  | 'DateTime'

  // 🔥 Signed integers
  | 'Int8'
  | 'Int16'
  | 'Int32'
  | 'Int64'

  // 🔥 Unsigned integers
  | 'UInt8'
  | 'UInt16'
  | 'UInt32'
  | 'UInt64'

  // 🔥 Floats
  | 'Float32'
  | 'Float64'

export type CHToTS<T extends CHPrimitive> =
  T extends 'UUID' ? string :
  T extends 'String' ? string :
  T extends 'Float64' ? number :
  T extends 'DateTime' ? Date :
  never


export type NumericCHType =
  | 'Int8'
  | 'Int16'
  | 'Int32'
  | 'Int64'
  | 'UInt8'
  | 'UInt16'
  | 'UInt32'
  | 'UInt64'
  | 'Float32'
  | 'Float64'

