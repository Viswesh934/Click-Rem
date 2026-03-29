import type { Table, TableSchema } from '../schema/table.js'
import type { Column } from '../schema/column.js'

export async function addColumn<T extends TableSchema>(
  client: { command: (args: { query: string }) => Promise<unknown> },
  table: Table<T>,
  columnName: string,
  column: Column<any>
): Promise<void> {
  await client.command({
    query: `ALTER TABLE ${table.name} ADD COLUMN ${columnName} ${column.type}`
  })
}

export async function dropColumn<T extends TableSchema>(
  client: { command: (args: { query: string }) => Promise<unknown> },
  table: Table<T>,
  columnName: keyof T
): Promise<void> {
  await client.command({
    query: `ALTER TABLE ${table.name} DROP COLUMN ${String(columnName)}`
  })
}