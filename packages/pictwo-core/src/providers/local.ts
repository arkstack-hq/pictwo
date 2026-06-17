import { DEFAULT_LOCAL_BASE } from '../presets'
import { StaticProvider } from './static'
import { trimTrailingSlash } from '../internal'

/**
 * Generates local/static paths, e.g.
 *
 *   /pictwo/images/fashion/original/model-001.jpg
 *   /pictwo/images/fashion/400x400/model-001.webp
 */
export class LocalProvider extends StaticProvider {
  readonly driver = 'local'
  private readonly base: string

  constructor (baseUrl: string = DEFAULT_LOCAL_BASE) {
    super()
    this.base = trimTrailingSlash(baseUrl)
  }

  protected assetUrl (category: string, folder: string, file: string): string {
    return `${this.base}/${category}/${folder}/${file}`
  }
}
