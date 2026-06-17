import { DEFAULT_ASSET_DIR, DEFAULT_JSDELIVR_BASE } from '../presets'
import { StaticProvider } from './static'
import { trimTrailingSlash } from '../internal'

/**
 * Generates jsDelivr CDN URLs for the `@pictwo/images` package, e.g.
 *
 *   https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/img/fashion/original/model-001.webp
 *   https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/img/fashion/400x400/model-001.webp
 *
 * The served directory defaults to `img` — the optimized distribution shipped
 * to npm (the full-resolution `images/` source is excluded from the package).
 */
export class JsDelivrProvider extends StaticProvider {
  readonly driver = 'jsdelivr'
  // jsDelivr only serves pre-generated variants, so snap unknown sizes to the
  // nearest available one rather than serving a full-size original.
  protected readonly defaultFallback = 'nearest' as const
  private readonly base: string
  private readonly assetDir: string

  constructor (
    private readonly packageName: string,
    private readonly version: string,
    baseUrl: string = DEFAULT_JSDELIVR_BASE,
    assetDir: string = DEFAULT_ASSET_DIR,
  ) {
    super()
    this.base = trimTrailingSlash(baseUrl)
    this.assetDir = assetDir.replace(/^\/+|\/+$/g, '')
  }

  protected assetUrl (category: string, folder: string, file: string): string {
    return `${this.base}/${this.packageName}@${this.version}/${this.assetDir}/${category}/${folder}/${file}`
  }
}
