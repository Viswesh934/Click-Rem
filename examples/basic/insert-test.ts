import {db} from './index'
import { ch } from '../../packages/core/src/schema/column.js'
import { chTable } from '../../packages/core/src/schema/table.js'

// Define your table schema
const events = chTable('events', {
  id: ch.uuid(),
  event: ch.string(),
  amount: ch.float64(),
  timestamp: ch.datetime()
}, {
  orderBy: 'timestamp'
})

async function main() {
  // Table is auto-created on first insert if it doesn't exist
  await db.ensureTable(events)
  // No need to manually call createTable!

  // ✅ TYPE-SAFE INSERT - Table created automatically
  await db.insert(events, {
    id: crypto.randomUUID(),
    event: 'test_insert',
    amount: 50,
    timestamp: new Date()
  })

  // ✅ Multiple records - Still type-safe
  await db.insert(events, [
    {
      id: crypto.randomUUID(),
      event: 'purchase',
      amount: 99.99,
      timestamp: new Date()
    },
    {
      id: crypto.randomUUID(),
      event: 'refund',
      amount: -25.50,
      timestamp: new Date()
    }
  ])

  // Query the data
  const data = await db.sql`
    SELECT * FROM events ORDER BY timestamp DESC LIMIT 5
  `

  console.log('Events:', data)
  
  await db.close()
}

main()