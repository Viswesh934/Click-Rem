import type { Column } from './column'
import type { NumericCHType } from './types'

/**
 * SUM
 */
export type SumMetric<T extends Column<NumericCHType>> = {
  kind: 'sum'
  column: T
}

/**
 * AVG
 */
export type AvgMetric<T extends Column<NumericCHType>> = {
  kind: 'avg'
  column: T
}

/**
 * MIN
 */
export type MinMetric<T extends Column<NumericCHType>> = {
  kind: 'min'
  column: T
}

/**
 * MAX
 */
export type MaxMetric<T extends Column<NumericCHType>> = {
  kind: 'max'
  column: T
}

/**
 * COUNT
 */
export type CountMetric = {
  kind: 'count'
}

/**
 * Union (no any)
 */
export type Metric =
  | SumMetric<Column<NumericCHType>>
  | AvgMetric<Column<NumericCHType>>
  | MinMetric<Column<NumericCHType>>
  | MaxMetric<Column<NumericCHType>>
  | CountMetric

/**
 * Builders
 */
export function sum<T extends Column<NumericCHType>>(col: T): SumMetric<T> {
  return { kind: 'sum', column: col }
}

export function avg<T extends Column<NumericCHType>>(col: T): AvgMetric<T> {
  return { kind: 'avg', column: col }
}

export function min<T extends Column<NumericCHType>>(col: T): MinMetric<T> {
  return { kind: 'min', column: col }
}

export function max<T extends Column<NumericCHType>>(col: T): MaxMetric<T> {
  return { kind: 'max', column: col }
}

export function count(): CountMetric {
  return { kind: 'count' }
}