import { DEFAULT_JSDELIVR_BASE } from '../presets'
import { StaticProvider } from './static'
import { trimTrailingSlash } from '../internal'

/**
 * Generates jsDelivr CDN URLs for the `@pictwo/images` package, e.g.
 *
 *   https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/images/fashion/original/model-001.jpg
 *   https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/images/fashion/400x400/model-001.webp
 */
export class JsDelivrProvider extends StaticProvider {
  readonly driver = 'jsdelivr'
  // jsDelivr only serves pre-generated variants, so snap unknown sizes to the
  // nearest available one rather than serving a full-size original.
  protected readonly defaultFallback = 'nearest' as const
  private readonly base: string

  constructor(
    private readonly packageName: string,
    private readonly version: string,
    baseUrl: string = DEFAULT_JSDELIVR_BASE,
  ) {
    super()
    this.base = trimTrailingSlash(baseUrl)
  }

  protected assetUrl (category: string, folder: string, file: string): string {
    return `${this.base}/${this.packageName}@${this.version}/images/${category}/${folder}/${file}`
  }
}
