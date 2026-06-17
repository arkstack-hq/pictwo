import type { ImageOptions, SizeDimensions, SizePresets } from './types'
import { DEFAULT_DIMENSIONS } from './presets'

/**
 * Internal, fully-resolved request passed to a provider. Built from the public
 * {@link ImageOptions} plus routing hints set by the image API.
 */
export interface ImageRequest extends ImageOptions {
  category?: string
  /** Force the dedicated `/seed/{seed}/...` hosted route. */
  seedRoute?: boolean
}

/**
 * Deterministic 32-bit string hash, byte-for-byte compatible with the hosted
 * ArkStack API's `seedIndex` so seeded selection matches across providers.
 */
export function seedIndex (seed: string | number, total: number): number {
  if (total <= 0) return 0
  const s = String(seed)
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = (Math.imul(31, hash) + s.charCodeAt(i)) | 0
  }

  return Math.abs(hash) % total
}

/** Strip a file extension, returning the base id (e.g. `model-001.jpg` -> `model-001`). */
export function stripExt (file: string): string {
  const dot = file.lastIndexOf('.')

  return dot > 0 ? file.slice(0, dot) : file
}

/**
 * Resolve final width/height. Explicit dims win, then a size preset, then the
 * global fallback. Used by the hosted provider, which always needs dimensions.
 */
export function resolveDimensions (
  req: ImageRequest,
  presets: SizePresets,
  fallback: SizeDimensions = DEFAULT_DIMENSIONS,
): SizeDimensions {
  let base = fallback
  if (req.size && presets[req.size]) base = presets[req.size]

  return {
    width: req.width ?? base.width,
    height: req.height ?? base.height,
  }
}

/**
 * Dimensions only when the caller *explicitly* asked for a size (width/height
 * or a preset). Returns `null` otherwise — used by static providers to decide
 * between an `original` asset and a generated variant folder.
 */
export function explicitDimensions (
  req: ImageRequest,
  presets: SizePresets,
): SizeDimensions | null {
  if (req.size && presets[req.size]) {
    const p = presets[req.size]

    return { width: req.width ?? p.width, height: req.height ?? p.height }
  }
  if (req.width != null && req.height != null) return { width: req.width, height: req.height }
  if (req.width != null) return { width: req.width, height: req.width }

  return null
}

/**
 * Build a query string without percent-encoding, preserving the literal commas
 * and colons used by Toneflix filters (e.g. `?filters=greyscale,blur:4`).
 */
export function buildQuery (params: Record<string, string | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}=${v}`)

  return parts.length ? `?${parts.join('&')}` : ''
}

/** Normalise a format into a URL extension (no leading dot). */
export function formatExt (format?: string): string {
  return format ? `.${format}` : ''
}

/** Trim a single trailing slash from a base URL/path. */
export function trimTrailingSlash (base: string): string {
  return base.endsWith('/') ? base.slice(0, -1) : base
}
