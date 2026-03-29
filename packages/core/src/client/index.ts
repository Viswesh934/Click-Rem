import {
  createClient as createCHClient,
  type ClickHouseClient
} from '@clickhouse/client'

import type { Table, TableSchema } from '../schema/table.js'
import type { Infer } from '../schema/infer.js'
import { generateCreateTableSQL } from '../schema/toSQL.js'
import { addColumn, dropColumn } from './alterTable.js'
import type { Column } from '../schema/column.js'
import type { CHPrimitive } from '../schema/types.js'

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