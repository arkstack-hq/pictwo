import type { SizeDimensions, SizePresets } from './types'

/** The live ArkStack Pictwo API. */
export const DEFAULT_PICTWO_HOST = 'https://pictwo.toneflix.net'

/** jsDelivr CDN base for npm package assets. */
export const DEFAULT_JSDELIVR_BASE = 'https://cdn.jsdelivr.net/npm'

/** Default local/static base path. */
export const DEFAULT_LOCAL_BASE = '/pictwo/images'

/** Fallback dimensions used when neither explicit dims nor a preset are given. */
export const DEFAULT_DIMENSIONS: SizeDimensions = { width: 640, height: 480 }

export const DEFAULT_SIZE_PRESETS: SizePresets = {
  avatar: { width: 128, height: 128 },
  thumb: { width: 256, height: 256 },
  card: { width: 400, height: 400 },
  portrait: { width: 600, height: 800 },
  cover: { width: 1200, height: 600 },
  og: { width: 1200, height: 630 },
}
