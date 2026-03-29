import 'dotenv/config'

import { createClient } from '../../packages/core/src/client/index.js'
import { ch } from '../../packages/core/src/schema/column.js'
import { chTable } from '../../packages/core/src/schema/table.js'

const db = createClient({
  url: process.env.CLICKHOUSE_HOST!,
  username: process.env.CLICKHOUSE_USERNAME!,
  password: process.env.CLICKHOUSE_PASSWORD!,
  database: process.env.CLICKHOUSE_DB!
})

// 🔥 define schema (with config inside)
const events = chTable(
  'events_demo',
  {
    id: ch.uuid(),
    event: ch.string(),
    amount: ch.float64(),
    timestamp: ch.datetime()
  },
  {
    orderBy: 'timestamp'
  }
)

async function main() {
  console.log('--- Creating table ---')
  await db.ensureTable(events)

  console.log('--- Inserting data ---')
  await db.insert(events, [
    {
      id: crypto.randomUUID(),
      event: 'signup',
      amount: 10,
      timestamp: new Date()
    },
    {
      id: crypto.randomUUID(),
      event: 'purchase',
      amount: 99,
      timestamp: new Date()
    }
  ])

  console.log('--- Querying ---')
  const data = await db.sql`
    SELECT * FROM ${events.name}
    ORDER BY timestamp DESC
    LIMIT 5
  `
  console.log(data)

  console.log('--- Alter: Add column ---')
  await db.addColumn(events, 'country', ch.string())

  console.log('--- Insert with new column ---')
  await db.insert(events, {
    id: crypto.randomUUID(),
    event: 'purchase',
    amount: 120,
    timestamp: new Date(),
    country: 'IN' // ⚠️ TS won't enforce yet (future improvement)
  } as any) // temporary workaround

  console.log('--- Truncate table ---')
  await db.truncateTable(events)

  const afterTruncate = await db.sql`
    SELECT count() as count FROM ${events.name}
  `
  console.log('After truncate:', afterTruncate)

  console.log('--- Drop table ---')
  await db.dropTable(events)

  console.log('✅ Flow complete')
}

main()