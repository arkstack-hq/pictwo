/**
 * The driver that decides how URLs are produced.
 *
 * - `hosted`   — the live ArkStack Pictwo API (runtime Sharp processing)
 * - `jsdelivr` — static assets served from the `@pictwo/images` npm package
 * - `local`    — static assets served from a local/static path
 */
export type ImageProvider = 'hosted' | 'jsdelivr' | 'local'

import type { KnownCategory } from './categories'

/** Known categories shipped by `@pictwo/images`, plus any custom string. */
export type ImageCategory = KnownCategory | (string & {})

/** Output formats understood by the hosted API and the variant generator. */
export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'

/** Named size presets (see {@link DEFAULT_SIZE_PRESETS}) plus any custom string. */
export type SizePreset = 'avatar' | 'thumb' | 'card' | 'portrait' | 'cover' | 'og' | (string & {})

export interface ImageOptions {
  /** Deterministic selection seed — same seed + category yields the same image. */
  seed?: string | number
  /** Select a specific image by its file id (basename without extension). */
  id?: string
  width?: number
  height?: number
  /** Named preset that resolves to a width/height pair. */
  size?: SizePreset
  format?: ImageFormat
  /** Toneflix-style filters, e.g. `['greyscale', 'blur:4']`. */
  filters?: string[]
  /**
   * Behaviour when a requested static variant is missing (jsdelivr/local only).
   * - `original` — fall back to the original asset URL
   * - `nearest` — snap to the closest available variant (jsdelivr default)
   * - `throw` — raise a clear error
   *
   * Defaults to `nearest` for the jsdelivr provider and `original` for local.
   */
  fallback?: 'original' | 'nearest' | 'throw'
}

/** A width/height pair resolved from a preset or explicit options. */
export interface SizeDimensions {
  width: number
  height: number
}

export type SizePresets = Record<string, SizeDimensions>

/** Source configuration for each supported provider. */
export type PictwoSource =
  | { driver: 'hosted'; baseUrl?: string }
  | { driver: 'jsdelivr'; packageName: string; version: string; baseUrl?: string; assetDir?: string }
  | { driver: 'local'; baseUrl?: string }

export interface PictwoConfig {
  /** Where images come from. Defaults to the hosted ArkStack API. */
  source?: PictwoSource
  /** Override or extend the built-in size presets. */
  sizePresets?: SizePresets
  /** Manifest backing static (jsdelivr/local) file selection. */
  manifest?: ImageManifest
}

/** A single category entry inside an {@link ImageManifest}. */
export interface ImageManifestCategory {
  original: string[]
  variants?: Record<string, string[]>
}

/** Describes the static assets available for jsdelivr/local providers. */
export interface ImageManifest {
  version: number
  categories: Record<string, ImageManifestCategory>
}
