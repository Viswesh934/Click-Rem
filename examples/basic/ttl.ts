import {db} from './index'
import { ch } from '../../packages/core/src/schema/column'
import { chTable } from '../../packages/core/src/schema/table'



const table = chTable(
  'events_ttl_test',
  {
    id: ch.uuid(),
    amount: ch.float64(),
    timestamp: ch.datetime()
  },
  {
    orderBy: ['timestamp'],
    ttl: 'timestamp + INTERVAL 1 DAY'
  }
)

async function main() {
  console.log('--- Creating TTL table ---')
  await db.ensureTable(table)

  console.log('--- Verifying TTL from system.tables ---')

  const res = await db.sql<{
  name: string
  engine: string
  create_table_query: string
}>`
  SELECT
    name,
    engine,
    create_table_query
  FROM system.tables
  WHERE name = 'events_ttl_test'
`

  console.log(res)

  const query = res[0]?.create_table_query ?? ''

  if (!query.includes('TTL')) {
    throw new Error('❌ TTL not found in table definition')
  }

  console.log('✅ TTL clause detected')

  console.log('--- Inserting test data ---')

  const now = new Date()
  const old = new Date()
  old.setDate(old.getDate() - 2) // older than TTL

  await db.insert(table, [
    {
      id: crypto.randomUUID(),
      amount: 100,
      timestamp: now
    },
    {
      id: crypto.randomUUID(),
      amount: 999,
      timestamp: old // should expire eventually
    }
  ])

  console.log('--- Checking row count (before TTL cleanup) ---')

  const countBefore = await db.sql`
    SELECT count() as count FROM ${table.name}
  `

  console.log('Rows before TTL cleanup:', countBefore)

  console.log('--- Forcing TTL cleanup (optional) ---')

  try {
    await db.sql`OPTIMIZE TABLE ${table.name} FINAL`
    console.log('OPTIMIZE triggered')
  } catch {
    console.log('OPTIMIZE not supported in this setup')
  }

  const countAfter = await db.sql`
    SELECT count() as count FROM ${table.name}
  `

  console.log('Rows after OPTIMIZE:', countAfter)

  console.log('--- Cleanup ---')
  await db.dropTable(table)
  await db.close()

  console.log('✅ TTL test complete')
}

main()