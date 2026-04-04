import {
  createClient as createCHClient,
  type ClickHouseClient
} from '@clickhouse/client'
import type { Table, TableSchema } from '../schema/table'
import type { Infer } from '../schema/infer'
import { generateCreateTableSQL } from '../schema/toSQL'
import { addColumn, dropColumn } from './alterTable'
import type { Column } from '../schema/column'
import type { CHPrimitive } from '../schema/types'
import { aggregate } from './aggregate'
import type { Metric } from '../schema/metrics'
import type { Dimension } from '../schema/dimensions'
import type { Where } from '../schema/filters'

export function createClient(config: {
  url: string
  username?: string
  password?: string
  database?: string
}) {
  const client: ClickHouseClient = createCHClient(config)

  return {
    // 🔥 INSERT (typed)
    async insert<T extends TableSchema>(
      table: Table<T>,
      values: Infer<Table<T>> | Infer<Table<T>>[]
    ): Promise<void> {
      const rows = Array.isArray(values) ? values : [values]

      await client.insert({
        table: table.name,
        values: rows,
        format: 'JSONEachRow'
      })
    },

    // 🔥 CREATE TABLE
    async createTable<T extends TableSchema>(
      table: Table<T>
    ): Promise<void> {
      const query = generateCreateTableSQL(table)
      await client.command({ query })
    },

    // 🔥 AUTO CREATE (idempotent)
    async ensureTable<T extends TableSchema>(
      table: Table<T>
    ): Promise<void> {
      await this.createTable(table)
    },

    // 🔥 DROP TABLE
    async dropTable<T extends TableSchema>(
      table: Table<T>
    ): Promise<void> {
      await client.command({
        query: `DROP TABLE IF EXISTS ${table.name}`
      })
    },

    // 🔥 TRUNCATE TABLE
    async truncateTable<T extends TableSchema>(
      table: Table<T>
    ): Promise<void> {
      await client.command({
        query: `TRUNCATE TABLE ${table.name}`
      })
    },

    // 🔥 ALTER → ADD COLUMN
    async addColumn<T extends TableSchema>(
      table: Table<T>,
      columnName: string,
      column: Column<CHPrimitive>
    ): Promise<void> {
      return addColumn(client, table, columnName, column)
    },

    // 🔥 ALTER → DROP COLUMN
    async dropColumn<T extends TableSchema>(
      table: Table<T>,
      columnName: keyof T
    ): Promise<void> {
      return dropColumn(client, table, columnName)
    },

     // 🔥Aggregate Function
    async aggregate<
  T extends TableSchema,
  M extends Record<string, Metric>,
  D extends Record<string, Dimension> | undefined = undefined
>(
  table: Table<T>,
  query: { metrics: M; dimensions?: D, where?: Where<T> }
) {
  return aggregate(client, table, query)
},

    // 🔥 RAW SQL (escape hatch)
    async sql<T = unknown>(
      strings: TemplateStringsArray,
      ...values: unknown[]
    ): Promise<T[]> {
      const query = String.raw(strings, ...values)

      const res = await client.query({
        query,
        format: 'JSONEachRow'
      })

      return res.json<T>()
    },


    async close(): Promise<void> {
      await client.close()
    }
  }
}