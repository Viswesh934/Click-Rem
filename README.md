<p align="center">
  <img src="assets/logo.png" width="110" alt="Click-Rem Logo" />
</p>

<h1 align="center">Click-Rem</h1>

<p align="center">
  <strong>Type-safe analytics toolkit for ClickHouse ⚡</strong>
</p>

> Type-safe analytics toolkit for ClickHouse with first-class Fastify support

Click-Rem is a developer-first toolkit that makes working with ClickHouse in Node.js simple, type-safe, and production-ready — without forcing ORM-style abstractions that don’t fit analytics workloads.

---

## ✨ Why Click-Rem?

ClickHouse is incredibly powerful, but:

* Raw SQL gets messy at scale
* No strong TypeScript ecosystem
* ORMs don’t fit analytics use cases

Click-Rem solves this by providing:

✅ Type-safe schema definitions
✅ Safe inserts with compile-time checks
✅ Analytics-first query builder
✅ Raw SQL escape hatch (no lock-in)
✅ Fastify plugin for seamless backend integration

---

## 🧠 Philosophy

Click-Rem is **not an ORM**.

Instead of hiding SQL, it embraces it — while adding:

* type safety
* better developer experience
* reusable analytics patterns

---

## 📦 Packages

```text
packages/
  core/        # Core type-safe ClickHouse toolkit
  fastify/     # Fastify plugin
```

---

## ⚡ Quick Start

### Install

```bash
npm install @click-rem/core
```

---

### Create a client

```ts
import { createClient } from '@click-rem/core'

const db = createClient({
  url: 'http://localhost:8123'
})
```

---

### Define a table

```ts
import { chTable } from '@click-rem/core'

const events = chTable('events', {
  id: 'UUID',
  event: 'String',
  amount: 'Float64',
  timestamp: 'DateTime'
})
```

---

### Insert data

```ts
await db.insert(events, {
  id: crypto.randomUUID(),
  event: 'order_completed',
  amount: 100,
  timestamp: new Date()
})
```

---

### Query data

```ts
const result = await db.query({
  query: `
    SELECT event, sum(amount) as total
    FROM events
    GROUP BY event
  `,
  format: 'JSONEachRow'
})
```

---

### Typed SQL (recommended)

```ts
const result = await db.sql<{
  event: string
  total: number
}>`
  SELECT event, sum(amount) as total
  FROM events
  GROUP BY event
`
```

---

## 🔌 Fastify Integration

```bash
npm install @click-rem/fastify
```

```ts
import Fastify from 'fastify'
import clickRem from '@click-rem/fastify'

const app = Fastify()

app.register(clickRem, {
  url: 'http://localhost:8123'
})

app.get('/analytics', async (req, reply) => {
  return app.clickRem.sql`
    SELECT count() as total FROM events
  `
})
```

---

## 🧩 Features (Planned)

* [ ] Schema validation & inference
* [ ] Query builder (analytics-focused)
* [ ] Batch ingestion utilities
* [ ] Event tracking helper (`track()`)
* [ ] Time-series helpers (daily/weekly aggregations)
* [ ] Lightweight CLI

---

## 🚧 Project Status

> Early development — APIs may change.

We’re actively shaping the core abstractions. Contributions and feedback are welcome!

---

## 🛠️ Use Cases

* Event tracking systems
* Product analytics
* Business intelligence dashboards
* Log processing pipelines
* High-volume reporting systems

---

## 🤝 Contributing

PRs, ideas, and discussions are welcome!

If you're building with ClickHouse, we'd love to hear your use case.

---

## 📜 License

MIT

---

## 💡 Vision

Click-Rem aims to become:

> The go-to TypeScript toolkit for building analytics systems on ClickHouse

---
