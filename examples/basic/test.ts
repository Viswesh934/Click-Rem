import 'dotenv/config'
import { createClient } from '../../packages/core/src/client'

async function main() {
  const db = createClient()

  const result = await db.sql<{ number: number }>`
    SELECT 1 as number
  `

  console.log(result)

  await db.close()
}

main()