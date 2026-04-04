// engine.ts
import {type EngineConfig } from "./types"

export function getEngineSQL(engine?: EngineConfig): string {
  if (!engine || engine.type === 'MergeTree') {
    return 'MergeTree'
  }

  if (engine.type === 'ReplacingMergeTree') {
    return engine.versionColumn
      ? `ReplacingMergeTree(${engine.versionColumn})`
      : 'ReplacingMergeTree'
  }

  if (engine.type === 'SummingMergeTree') {
    return engine.columns?.length
      ? `SummingMergeTree((${engine.columns.join(', ')}))`  // ← Double parentheses for tuple syntax
      : 'SummingMergeTree'
  }

  return 'MergeTree'
}