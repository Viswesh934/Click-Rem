import {db} from './index'

async function main() {
  console.log('═'.repeat(60))
  console.log('🔍 SummingMergeTree Syntax Tests')
  console.log('═'.repeat(60))

  // Test 1: Arguments in parentheses (our current approach)
  console.log('\n📋 Test 1: SummingMergeTree(amount, count)')
  try {
    await db.sql`
      CREATE TABLE IF NOT EXISTS test_summing1 (
        id UUID,
        amount Float64,
        count Int32,
        timestamp DateTime
      )
      ENGINE = SummingMergeTree(amount, count)
      ORDER BY (timestamp)
    `
    console.log('✅ Success')
    await db.sql`DROP TABLE test_summing1`
  } catch (e) {
    console.error('❌ Failed:', (e as Error).message)
  }

  // Test 2: With tuple syntax
  console.log('\n📋 Test 2: SummingMergeTree((amount, count))')
  try {
    await db.sql`
      CREATE TABLE IF NOT EXISTS test_summing2 (
        id UUID,
        amount Float64,
        count Int32,
        timestamp DateTime
      )
      ENGINE = SummingMergeTree((amount, count))
      ORDER BY (timestamp)
    `
    console.log('✅ Success')
    await db.sql`DROP TABLE test_summing2`
  } catch (e) {
    console.error('❌ Failed:', (e as Error).message)
  }

  // Test 3: Single argument
  console.log('\n📋 Test 3: SummingMergeTree(amount)')
  try {
    await db.sql`
      CREATE TABLE IF NOT EXISTS test_summing3 (
        id UUID,
        amount Float64,
        count Int32,
        timestamp DateTime
      )
      ENGINE = SummingMergeTree(amount)
      ORDER BY (timestamp)
    `
    console.log('✅ Success')
    await db.sql`DROP TABLE test_summing3`
  } catch (e) {
    console.error('❌ Failed:', (e as Error).message)
  }

  // Test 4: Columns with backticks
  console.log('\n📋 Test 4: SummingMergeTree(\`amount\`, \`count\`)')
  try {
    await db.sql`
      CREATE TABLE IF NOT EXISTS test_summing4 (
        id UUID,
        amount Float64,
        count Int32,
        timestamp DateTime
      )
      ENGINE = SummingMergeTree(\`amount\`, \`count\`)
      ORDER BY (timestamp)
    `
    console.log('✅ Success')
    await db.sql`DROP TABLE test_summing4`
  } catch (e) {
    console.error('❌ Failed:', (e as Error).message)
  }

  // Test 5: Check ClickHouse version
  console.log('\n📋 Test 5: Check ClickHouse version')
  try {
    const version = await db.sql`SELECT version()`
    console.log('Version:', version)
  } catch (e) {
    console.error('❌ Failed:', (e as Error).message)
  }

  await db.close()
}

main()