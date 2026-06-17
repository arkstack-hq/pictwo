export { createPictwo, pictwo } from './pictwo'
export type { Pictwo, ResolvedPictwoConfig } from './pictwo'
export type { ImageApi } from './image'

export {
  DEFAULT_PICTWO_HOST,
  DEFAULT_SIZE_PRESETS,
  DEFAULT_JSDELIVR_BASE,
  DEFAULT_LOCAL_BASE,
  DEFAULT_DIMENSIONS,
  DEFAULT_ASSET_DIR,
} from './presets'

export { seedIndex } from './internal'
export { nearestVariant } from './providers/static'
export { PICTWO_CATEGORIES, categoryMethodName } from './categories'
export type { KnownCategory } from './categories'

export type {
  PictwoConfig,
  PictwoSource,
  ImageOptions,
  ImageProvider,
  ImageCategory,
  ImageFormat,
  ImageManifest,
  ImageManifestCategory,
  SizePreset,
  SizePresets,
  SizeDimensions,
} from './types'
