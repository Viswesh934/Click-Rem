import { ch } from '../../packages/core/src/schema/column'
import { chTable } from '../../packages/core/src/schema/table'
import type { Infer } from '../../packages/core/src/schema/infer'

const events = chTable('events', {
  id: ch.uuid(),
  event: ch.string(),
  amount: ch.float64(),
  timestamp: ch.datetime()
}, {
  orderBy: 'timestamp'
})

type Event = Infer<typeof events>

// ✅ should autocomplete + type check
const test: Event = {
  id: 'abc',
  event: 'click',
  amount: 100,
  timestamp: new Date()
}

console.log(test)