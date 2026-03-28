import { createClient as createCHClient } from '@clickhouse/client'
import 'dotenv/config'

export function createClient() {
  const client = createCHClient({
    url: process.env.CLICKHOUSE_HOST!,
    username: process.env.CLICKHOUSE_USERNAME!,
    password: process.env.CLICKHOUSE_PASSWORD!,
    database: process.env.CLICKHOUSE_DB!,
  })

  return {
    async query(query: string) {
      const res = await client.query({
        query,
        format: 'JSONEachRow'
      })
      return res.json()
    },

    async sql<T = any>(
      strings: TemplateStringsArray,
      ...values: any[]
    ): Promise<T[]> {
      const query = String.raw(strings, ...values)

      const res = await client.query({
        query,
        format: 'JSONEachRow'
      })

      return res.json<T[]>()
    },

    async command(query: string) {
      await client.command({ query })
    },

    async close() {
      await client.close()
    }
  }
}