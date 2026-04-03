import type { Table,TableSchema } from '../schema/table'
import type { Metric } from '../schema/metrics'
import type { Dimension } from '../schema/dimensions'
import type { AggregateResult } from '../schema/aggregateTypes'
import { buildWhere } from './buildWhere'
import type { Where } from '../schema/filters'

export async function aggregate<
  TSchema extends TableSchema,
  M extends Record<string, Metric>,
  D extends Record<string, Dimension> | undefined = undefined
>(
  client: any,
  table: Table<TSchema>,
  query: {
    metrics: M
    dimensions?: D
    where?: Where<TSchema>
  }
): Promise<AggregateResult<M, D>[]> {
  const metricSQL = Object.entries(query.metrics).map(([alias, m]) => {
  switch (m.kind) {
    case 'sum':
      return `sum(${m.column.name}) as ${alias}`

    case 'avg':
      return `avg(${m.column.name}) as ${alias}`

    case 'min':
      return `min(${m.column.name}) as ${alias}`

    case 'max':
      return `max(${m.column.name}) as ${alias}`

    case 'count':
      return `count() as ${alias}`

    default:
      throw new Error('Unknown metric')
  }
})

  const dimSQL = query.dimensions
    ? Object.entries(query.dimensions).map(([alias, d]) => {
        if (d.kind === 'day') {
          return `toDate(${d.column.name}) as ${alias}`
        }
        throw new Error('Unknown dimension')
      })
    : []

  const select = [...dimSQL, ...metricSQL].join(',\n')

  const groupBy = dimSQL.length
    ? `GROUP BY ${dimSQL.map((_, i) => i + 1).join(', ')}`
    : ''
  
  const whereSQL = buildWhere(query.where)
   
  const sql = `
SELECT
${select}
FROM ${table.name}
${whereSQL}
${groupBy}
`

  const res = await client.query({
    query: sql,
    format: 'JSONEachRow'
  })

  return res.json()
}