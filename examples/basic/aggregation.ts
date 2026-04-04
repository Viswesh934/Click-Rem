import {db} from './index'
import { ch } from '../../packages/core/src/schema/column.js'
import { chTable } from '../../packages/core/src/schema/table.js'

import {
  sum,
  avg,
  min,
  max,
  count
} from '../../packages/core/src/schema/metrics.js'

import { day } from '../../packages/core/src/schema/dimensions.js'
import { last7Days } from '../../packages/core/src/schema/time.js'



const events = chTable(
  'events_v2_final',
  {
    id: ch.uuid(),
    event: ch.string(),
    amount: ch.float64(),
    timestamp: ch.datetime()
  },
  {
    orderBy: ['timestamp']
  }
)

async function main() {
  console.log('--- setup ---')
  await db.ensureTable(events)

  const now = new Date()
  const old = new Date()
  old.setDate(old.getDate() - 10)

  console.log('--- inserting data ---')
  await db.insert(events, [
    {
      id: crypto.randomUUID(),
      event: 'purchase',
      amount: 100,
      timestamp: now
    },
    {
      id: crypto.randomUUID(),
      event: 'purchase',
      amount: 200,
      timestamp: now
    },
    {
      id: crypto.randomUUID(),
      event: 'purchase',
      amount: 50,
      timestamp: now
    },
    {
      id: crypto.randomUUID(),
      event: 'purchase',
      amount: 999,
      timestamp: old // filtered out
    }
  ])

  console.log('--- aggregate ---')

  const result = await db.aggregate(events, {
    metrics: {
      total: sum(events.amount),
      average: avg(events.amount),
      minimum: min(events.amount),
      maximum: max(events.amount),
      count: count()
    },
    dimensions: {
      date: day(events.timestamp)
    },
    where: {
      event: 'purchase',
      timestamp: last7Days()
    }
  })

  console.log('result:', result)

  console.log('--- cleanup ---')
  await db.dropTable(events)
  await db.close()

  console.log('✅ done')
}

main()