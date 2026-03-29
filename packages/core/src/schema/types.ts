export type CHPrimitive =
  | 'UUID'
  | 'String'
  | 'Float64'
  | 'DateTime'

export type CHToTS<T extends CHPrimitive> =
  T extends 'UUID' ? string :
  T extends 'String' ? string :
  T extends 'Float64' ? number :
  T extends 'DateTime' ? Date :
  never