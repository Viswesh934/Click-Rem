import type { Column } from './column'

export type DateColumn = Column<'DateTime'>

export type DayDimension<T extends DateColumn> = {
  kind: 'day'
  column: T
}

export type Dimension =
  | DayDimension<DateColumn>

export function day<T extends DateColumn>(col: T): DayDimension<T> {
  return {
    kind: 'day',
    column: col
  }
}