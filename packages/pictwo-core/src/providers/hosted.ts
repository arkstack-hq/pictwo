import { buildQuery, formatExt, resolveDimensions, trimTrailingSlash } from '../internal'
import type { ImageRequest } from '../internal'
import type { Provider, ProviderContext } from './types'

/**
 * The hosted provider mirrors the live ArkStack Pictwo API route style:
 *
 *   /{width}/{height}
 *   /{width}/{height}.webp
 *   /id/{id}/{width}/{height}
 *   /seed/{seed}/{width}/{height}
 *   /category/{category}/{width}/{height}?seed=...
 *
 * The server performs runtime Sharp processing and image selection, so this
 * provider only needs to compose the correct route + query string.
 */
export class HostedProvider implements Provider {
  readonly driver = 'hosted'

  constructor (private readonly baseUrl: string) {}

  url (req: ImageRequest, ctx: ProviderContext): string {
    const { width, height } = resolveDimensions(req, ctx.presets)
    const ext = formatExt(req.format)
    const query: Record<string, string | undefined> = {}

    let path: string
    if (req.id != null) {
      path = `/id/${req.id}/${width}/${height}${ext}`
    } else if (req.category && !req.seedRoute) {
      path = `/category/${req.category}/${width}/${height}${ext}`
      if (req.seed != null) query.seed = String(req.seed)
    } else if (req.seed != null) {
      path = `/seed/${req.seed}/${width}/${height}${ext}`
    } else {
      path = `/${width}/${height}${ext}`
    }

    if (req.filters?.length) query.filters = req.filters.join(',')

    return trimTrailingSlash(this.baseUrl) + path + buildQuery(query)
  }
}
