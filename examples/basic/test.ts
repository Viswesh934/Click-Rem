import 'dotenv/config'
import { createClient } from '@clickhouse/client'

async function main() {
  const client = createClient({
    url: process.env.CLICKHOUSE_HOST!,
    username: process.env.CLICKHOUSE_USERNAME!,
    password: process.env.CLICKHOUSE_PASSWORD!,
    database: process.env.CLICKHOUSE_DB!,
  })

  const result = await client.query({
    query: 'SELECT 1 as number',
    format: 'JSONEachRow'
  })

  console.log(await result.json())

  await client.close()
}

main()