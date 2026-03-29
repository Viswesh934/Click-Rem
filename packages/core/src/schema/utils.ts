/**
 * Normalize single or array input into array to avoid union troubles
 */
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}