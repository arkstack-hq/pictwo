import type { ImageManifest, SizePresets } from '../types'
import type { ImageRequest } from '../internal'

/** Runtime context shared with every provider when building a URL. */
export interface ProviderContext {
  presets: SizePresets
  manifest?: ImageManifest
}

/** A provider turns a resolved {@link ImageRequest} into a URL string. */
export interface Provider {
  readonly driver: string
  url (req: ImageRequest, ctx: ProviderContext): string
}
