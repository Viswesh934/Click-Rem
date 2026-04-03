import type { Metric } from './metrics'
import type { Dimension } from './dimensions'

type MetricResult<T extends Metric> =
  T extends { kind: 'sum' } ? number :
  T extends { kind: 'count' } ? number :
  never

type DimensionResult<T extends Dimension> =
  T extends { kind: 'day' } ? string :
  never

export type AggregateResult<
  M extends Record<string, Metric>,
  D extends Record<string, Dimension> | undefined
> =
  (D extends Record<string, Dimension>
    ? { [K in keyof D]: DimensionResult<D[K]> }
    : {}) &
  { [K in keyof M]: MetricResult<M[K]> }