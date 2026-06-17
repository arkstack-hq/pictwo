/**
 * Canonical categories shipped by `@pictwo/images`. Kept in sync with the
 * folders under `packages/pictwo-images/images/`. Consumers may still target
 * any custom category string via `byCategory()`.
 */
export const PICTWO_CATEGORIES = [
  'african-fashion',
  'album',
  'avatar',
  'design',
  'event',
  'fabric',
  'fashion',
  'nature',
  'people',
  'poster',
  'product',
  'profile',
  'technology',
] as const

export type KnownCategory = (typeof PICTWO_CATEGORIES)[number]

/**
 * Convert a category slug into a camelCase method name
 * (e.g. `african-fashion` -> `africanFashion`).
 */
export function categoryMethodName (category: string): string {
  return category.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}
