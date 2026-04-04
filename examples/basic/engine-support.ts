import {db} from './index'
import { ch } from '../../packages/core/src/schema/column'
import { chTable } from '../../packages/core/src/schema/table'

async function main() {
  console.log('--- Engine Tests ---')

  // 🔹 MergeTree (default)
  const mergeTreeTable = chTable(
    'events_merge',
    {
      id: ch.uuid(),
      amount: ch.float64(),
      timestamp: ch.datetime()
    },
    {
      orderBy: ['timestamp']
    }
  )

  // 🔹 ReplacingMergeTree
  const replacingTable = chTable(
    'events_replacing',
    {
      id: ch.uuid(),
      amount: ch.float64(),
      timestamp: ch.datetime()
    },
    {
      orderBy: ['timestamp'],
      engine: {
        type: 'ReplacingMergeTree',
        versionColumn: 'timestamp'
      }
    }
  )

  // 🔹 SummingMergeTree
  const summingTable = chTable(
    'events_summing',
    {
      id: ch.uuid(),
      amount: ch.float64(),
      count: ch.int32(),
      timestamp: ch.datetime()
    },
    {
      orderBy: ['timestamp'],
      engine: {
        type: 'SummingMergeTree',
        columns: ['amount', 'count']
      }
    }
  )

  console.log('--- Creating tables ---')

  await db.ensureTable(mergeTreeTable)
  await db.ensureTable(replacingTable)
  await db.ensureTable(summingTable)

  console.log('--- Verifying tables ---')

  const tables = await db.sql`
    SELECT name, engine
    FROM system.tables
    WHERE name IN ('events_merge', 'events_replacing', 'events_summing')
  `

  console.log(tables)

  console.log('--- Cleanup ---')

  await db.dropTable(mergeTreeTable)
  await db.dropTable(replacingTable)
  await db.dropTable(summingTable)

  await db.close()

  console.log('✅ Engine test complete')
}

main()