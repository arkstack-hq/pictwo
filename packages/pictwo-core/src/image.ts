import type { ImageCategory, ImageOptions } from './types'
import type { ImageRequest } from './internal'
import type { Provider, ProviderContext } from './providers/types'

/** The fluent image-URL API exposed as `pictwo.image`. */
export interface ImageApi {
  /** Generic image. Hosted: `/{width}/{height}`. */
  url (options?: ImageOptions): string
  avatar (options?: ImageOptions): string
  fashion (options?: ImageOptions): string
  fabric (options?: ImageOptions): string
  product (options?: ImageOptions): string
  design (options?: ImageOptions): string
  /** Pick from a specific category. Hosted: `/category/{category}/{width}/{height}`. */
  byCategory (category: ImageCategory, options?: ImageOptions): string
  /** Select a specific image by id. Hosted: `/id/{id}/{width}/{height}`. */
  byId (id: string, options?: ImageOptions): string
  /** Deterministic seed route. Hosted: `/seed/{seed}/{width}/{height}`. */
  seed (seed: string | number, options?: ImageOptions): string
}

export function createImageApi (provider: Provider, ctx: ProviderContext): ImageApi {
  const build = (req: ImageRequest): string => provider.url(req, ctx)

  return {
    url: (options = {}) => build({ ...options }),
    avatar: (options = {}) => build({ category: 'avatar', ...options }),
    fashion: (options = {}) => build({ category: 'fashion', ...options }),
    fabric: (options = {}) => build({ category: 'fabric', ...options }),
    product: (options = {}) => build({ category: 'product', ...options }),
    design: (options = {}) => build({ category: 'design', ...options }),
    byCategory: (category, options = {}) => build({ category, ...options }),
    byId: (id, options = {}) => build({ id, ...options }),
    seed: (seed, options = {}) => build({ seed, seedRoute: true, ...options }),
  }
}
