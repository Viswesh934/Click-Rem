import {db} from './index'
import { ch } from '../../packages/core/src/schema/column'
import { chTable } from '../../packages/core/src/schema/table'
import { sum, count } from '../../packages/core/src/schema/metrics'
import { day } from '../../packages/core/src/schema/dimensions'
import { last7Days, between } from '../../packages/core/src/schema/time'


const events = chTable(
  'events_time_test',
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
  const oldDate = new Date()
  oldDate.setDate(oldDate.getDate() - 10) // outside 7 days

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
      amount: 999,
      timestamp: oldDate // should be filtered out
    }
  ])

  console.log('--- aggregate: last7Days ---')
  const result1 = await db.aggregate(events, {
    metrics: {
      totalRevenue: sum(events.amount),
      totalEvents: count()
    },
    dimensions: {
      date: day(events.timestamp)
    },
    where: {
      timestamp: last7Days()
    }
  })

  console.log('result (last7Days):', result1)

  console.log('--- aggregate: between ---')
  const result2 = await db.aggregate(events, {
    metrics: {
      totalRevenue: sum(events.amount)
    },
    where: {
      timestamp: between(
        new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        now
      )
    }
  })

  console.log('result (between):', result2)

  console.log('--- cleanup ---')
  await db.dropTable(events)
  await db.close()

  console.log('✅ done')
}

main()