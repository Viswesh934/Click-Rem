# Click-Rem

> **Type-safe analytics layer for ClickHouse** — Build metrics dashboards with confidence.

[![npm version](https://img.shields.io/npm/v/click-rem.svg?style=flat-square)](https://www.npmjs.com/package/click-rem)
[![npm downloads](https://img.shields.io/npm/dm/click-rem.svg?style=flat-square)](https://www.npmjs.com/package/click-rem)
[![license](https://img.shields.io/npm/l/click-rem.svg?style=flat-square)](https://github.com/Viswesh934/Click-Rem/blob/main/LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-Click--Rem-blue?style=flat-square&logo=github)](https://github.com/Viswesh934/Click-Rem)

---

## 🎯 The Problem

ClickHouse is **incredibly fast** — but writing analytics on top of it is **tedious**:

```ts
// ❌ No type safety. Brittle. Copy-paste hell.
const revenue = await client.query({
  query: `
    SELECT 
      toDate(timestamp) as date,
      SUM(amount) as total
    FROM events
    WHERE event = 'purchase'
    GROUP BY date
  `
})

// What if 'amount' doesn't exist? Runtime error 💥
// What if schema changes? Dead code 🪦
```

---

## ✨ The Solution

**Click-Rem** gives you **typed schemas** + **composable queries** + **zero boilerplate**:

```ts
import { ch, chTable, createClient, sum, count } from 'click-rem'

// 1️⃣ Define schema with types
const events = chTable('events', {
  id: ch.uuid(),
  event: ch.string(),
  amount: ch.float64(),
  user_id: ch.string(),
  timestamp: ch.datetime()
}, {
  orderBy: ['timestamp']
})

// 2️⃣ Create typed client
const db = createClient({ url: process.env.CLICKHOUSE_HOST! })

// 3️⃣ Write safe, readable queries
const revenue = await db.aggregate(events, {
  metrics: {
    total: sum(events.amount),
    count: count()
  },
  dimensions: {
    date: day(events.timestamp)
  },
  where: {
    event: 'purchase',
    timestamp: last7Days()
  }
})

// ✅ Fully typed. Autocomplete works. Refactoring is safe.
```

---

## 🚀 Features

| Feature | Example | Benefit |
|---------|---------|---------|
| **Typed Schemas** | `ch.uuid()`, `ch.float64()` | Catch errors at build time |
| **Smart Filters** | `last7Days()`, `between(start, end)` | Write dates like humans think |
| **Aggregations** | `sum()`, `avg()`, `min()`, `max()`, `count()` | No SQL string hunting |
| **Dimensions** | `hour()`, `day()`, `month()` | Group by time effortlessly |
| **Multiple Engines** | `MergeTree`, `ReplacingMergeTree`, `SummingMergeTree` | Right tool for the job |
| **TTL Policies** | `'timestamp + INTERVAL 30 DAY'` | Auto-cleanup old data |
| **Escape Hatch** | Raw `.sql` queries | When you need SQL power |

---

## 📦 Installation

```bash
npm install click-rem
```

**Requirements:** Node.js 18+, ClickHouse 24+

---

## 🏗️ Quick Start

### 1. Define Your Schema

```ts
import { ch, chTable } from 'click-rem'

const analytics = chTable(
  'page_views',
  {
    event_id: ch.uuid(),
    user_id: ch.string(),
    page: ch.string(),
    referrer: ch.nullable(ch.string()),
    duration: ch.int32(),
    timestamp: ch.datetime(),
    country: ch.string(),
    device: ch.string()
  },
  {
    orderBy: ['timestamp'],
    partitionBy: 'toYYYYMM(timestamp)',
    ttl: 'timestamp + INTERVAL 90 DAY'
  }
)
```

### 2. Initialize Client

```ts
import { createClient } from 'click-rem'

const db = createClient({
  url: process.env.CLICKHOUSE_HOST,
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
  database: 'analytics'
})

// Create table (idempotent)
await db.ensureTable(analytics)
```

### 3. Insert Data

```ts
// Single row
await db.insert(analytics, {
  event_id: crypto.randomUUID(),
  user_id: 'user_123',
  page: '/products',
  duration: 4500,
  timestamp: new Date(),
  country: 'US',
  device: 'mobile'
})

// Batch insert (efficient)
await db.insert(analytics, [
  { event_id: '...', user_id: 'user_123', ... },
  { event_id: '...', user_id: 'user_456', ... }
])
```

### 4. Query with Aggregations

```ts
import { sum, count, avg } from 'click-rem'
import { day, hour } from 'click-rem'
import { last7Days, thisMonth } from 'click-rem'

const result = await db.aggregate(analytics, {
  metrics: {
    pageViews: count(),
    uniqueUsers: count(analytics.user_id),
    avgDuration: avg(analytics.duration)
  },
  dimensions: {
    date: day(analytics.timestamp),
    country: analytics.country
  },
  where: {
    timestamp: last7Days(),
    country: 'US'
  }
})

// Result:
// [
//   { date: '2026-04-01', country: 'US', pageViews: 1500, uniqueUsers: 342, avgDuration: 3200 },
//   { date: '2026-04-02', country: 'US', pageViews: 1820, uniqueUsers: 401, avgDuration: 3100 },
//   ...
// ]
```

---

## 🔥 Advanced Examples

### Smart Filtering

```ts
where: {
  // Exact match
  country: 'US',
  
  // Comparisons
  duration: { gt: 1000 },        // >
  amount: { gte: 100 },          // >=
  views: { lt: 50 },             // <
  visits: { lte: 10 },           // <=
  
  // Time ranges
  timestamp: last7Days(),
  created_at: thisMonth(),
  updated_at: between(start, end),
  
  // Multiple conditions (AND)
  event: 'purchase',
  amount: { gt: 50 }
}
```

### Pre-Aggregated Metrics with SummingMergeTree

```ts
const metrics = chTable(
  'sales_metrics',
  {
    timestamp: ch.datetime(),
    country: ch.string(),
    category: ch.string(),
    revenue: ch.float64(),
    orders: ch.int32(),
    items_sold: ch.int32()
  },
  {
    orderBy: ['timestamp', 'country', 'category'],
    engine: {
      type: 'SummingMergeTree',
      columns: ['revenue', 'orders', 'items_sold']
    }
  }
)

// Queries are 100x faster — data is pre-summed! ⚡
const dailyRevenue = await db.aggregate(metrics, {
  metrics: {
    total_revenue: sum(metrics.revenue),
    total_orders: sum(metrics.orders)
  },
  dimensions: {
    date: day(metrics.timestamp)
  }
})
```

### Track Changes with ReplacingMergeTree

```ts
const users = chTable(
  'users',
  {
    user_id: ch.string(),
    email: ch.string(),
    name: ch.string(),
    tier: ch.string(),
    updated_at: ch.datetime()
  },
  {
    orderBy: ['user_id'],
    engine: {
      type: 'ReplacingMergeTree',
      versionColumn: 'updated_at'
    }
  }
)

// Always get latest state
const goldUsers = await db.sql`
  SELECT * FROM users FINAL
  WHERE tier = 'gold'
`
```

### Raw SQL (When You Need Power)

```ts
const custom = await db.sql`
  SELECT 
    toDate(timestamp) as date,
    SUM(amount) as revenue,
    COUNT(*) as orders,
    QUANTILE(0.95)(duration) as p95_duration
  FROM analytics
  WHERE timestamp >= now() - INTERVAL 30 DAY
  GROUP BY date
  ORDER BY date DESC
`
```

---

## 📊 Type Safety in Action

```ts
// ✅ Autocomplete works
const result = await db.aggregate(events, {
  metrics: {
    revenue: sum(events.amount)  // ← events.amount exists ✓
  }
})

// ❌ Typos caught at build time
const broken = await db.aggregate(events, {
  metrics: {
    revenue: sum(events.amout)   // Property 'amout' does not exist ✗
  }
})

// ✅ Schema changes = compiler errors
// If 'amount' is deleted, your code breaks immediately
// No runtime surprises in production 🙌
```

---

## 🎮 API Reference

### Schema Types

```ts
ch.int8()
ch.int16()
ch.int32()
ch.int64()
ch.uint8()
ch.uint16()
ch.uint32()
ch.uint64()

ch.float32()
ch.float64()

ch.string()
ch.uuid()
ch.datetime()
ch.date()

ch.nullable(ch.string())
ch.array(ch.string())
```

### Aggregations

```ts
sum(column)
avg(column)
min(column)
max(column)
count()
count(column)
countIf(condition)
```

### Time Functions

```ts
// Helpers
second(column)
minute(column)
hour(column)
day(column)
week(column)
month(column)
quarter(column)
year(column)

// Filters
now()
today()
yesterday()
last(N, 'days' | 'weeks' | 'months')
last7Days()
last30Days()
thisWeek()
thisMonth()
thisYear()
between(start, end)
before(date)
after(date)
```

### Client Methods

```ts
// DDL
await db.createTable(table)
await db.ensureTable(table)
await db.dropTable(table)
await db.truncateTable(table)

// DML
await db.insert(table, data)
await db.aggregate(table, query)

// Escape hatch
await db.sql`SELECT ...`

// Lifecycle
await db.close()
```

---

## 🏗️ Table Options

```ts
{
  orderBy: ['timestamp'],                              // Required
  primaryKey: ['user_id'],                             // Optional
  partitionBy: 'toYYYYMM(timestamp)',                 // Optional
  ttl: 'timestamp + INTERVAL 90 DAY',                 // Optional
  engine: {                                            // Optional
    type: 'MergeTree'                                  // or ReplacingMergeTree, SummingMergeTree
  }
}
```

---

## 🧠 Philosophy

Click-Rem is **not** an ORM. It's a **thin typed layer** over ClickHouse:

- ✅ Schema validation
- ✅ Type-safe aggregations  
- ✅ SQL generation helpers
- ❌ **No magic** — you still write SQL

Think of it as **TypeScript for ClickHouse analytics** — not a database abstraction.

---

## 🚨 When NOT to Use Click-Rem

- **Heavily relational data** → Use Postgres + an ORM
- **Document storage** → Use MongoDB
- **OLTP workloads** → Use a transactional DB
- **Simple queries** → Raw ClickHouse might be faster

Click-Rem shines for **time-series**, **metrics**, **logs**, **analytics** at scale.

---

## 📈 Performance Tips

1. **Use SummingMergeTree** for pre-aggregated metrics (100x faster)
2. **Partition by time** (`toYYYYMM(timestamp)`)
3. **Set TTL** to auto-delete old data
4. **Batch inserts** — send 1000+ rows at once
5. **Use `last7Days()`** instead of computing dates

---

## 🐛 Debugging

Enable verbose logging:

```ts
const db = createClient({
  url: '...',
  debug: true  // Logs all queries
})
```

---

## 📁 Project Structure

```
packages/
├── core/                    # Main library
│   ├── src/
│   │   ├── schema/         # Column, Table, Engine definitions
│   │   ├── client/         # Database client
│   │   └── index.ts        # Exports
│   └── package.json
└── examples/               # Example projects
```

**View on GitHub:** [Viswesh934/Click-Rem](https://github.com/Viswesh934/Click-Rem/tree/main/packages/)

---

## 🤝 Contributing

Found a bug? Have a feature idea?

```bash
git clone https://github.com/Viswesh934/Click-Rem.git
cd Click-Rem
npm install
npm run dev
npm run test
```

**[Open Issues](https://github.com/Viswesh934/Click-Rem/issues)** | **[Pull Requests](https://github.com/Viswesh934/Click-Rem/pulls)**

---

## 📄 License

MIT © [Viswesh](https://github.com/Viswesh934)

See [LICENSE](https://github.com/Viswesh934/Click-Rem/blob/main/LICENSE) for details.

---

## 🔗 Resources

- [ClickHouse Docs](https://clickhouse.com/docs)
- [MergeTree Engines](https://clickhouse.com/docs/engines/table-engines/mergetree-family)
- [GitHub Repository](https://github.com/Viswesh934/Click-Rem)


---

## ⭐ Show Your Support

If Click-Rem helps you, star the repo!

**[⭐ Star on GitHub](https://github.com/Viswesh934/Click-Rem)**

---

**Made without ❤️ by [Viswesh](https://github.com/Viswesh934)**