import type { ImageFormat, Pictwo } from '@pictwo/core'

/**
 * Query keys that are not seeds. Mirrors ToneflixController.extractSeed so the
 * CDN resolver stays a pure, dependency-free function (easy to unit test).
 */
const RESERVED = new Set([
  'w', 'h', 'width', 'height', 'filters', 'text',
  'grayscale', 'greyscale', 'blur', 'random', 'format', 'cdn',
])

function extractSeed (query: Record<string, string>): string | undefined {
  const keys = Object.keys(query).filter((k) => !RESERVED.has(k))
  if (!keys.length) return undefined

  return keys.map((k) => `${k}=${query[k]}`).join('&')
}

/**
 * Map a hosted image route (+ query) onto a `@pictwo/core` jsDelivr URL, honouring
 * the same shapes as the REST API: `/{w}/{h}`, `/id/…`, `/seed/…`, `/category/…`.
 * Dimensions snap to the nearest pre-generated variant (jsDelivr default).
 * CDN variants are served as webp unless an explicit `?format=` overrides it.
 */
export function resolveCdnUrl (pictwo: Pictwo, args: string, query: Record<string, string>): string {
  const format = (query.format as ImageFormat) || undefined
  const dims = (w?: string, h?: string) => ({
    width: w ? Number(w) : undefined,
    height: h ? Number(h) : undefined,
  })

  let m: RegExpMatchArray | null

  if ((m = args.match(/^id\/([^/]+?)\/(\d+)(?:\/(\d+))?(?:\.\w+)?$/))) {
    return pictwo.image.byId(m[1], { ...dims(m[2], m[3]), format })
  }
  if ((m = args.match(/^seed\/([^/]+)\/(\d+)(?:\/(\d+))?(?:\.\w+)?$/))) {
    return pictwo.image.seed(m[1], { ...dims(m[2], m[3]), format })
  }
  if ((m = args.match(/^category\/([^/]+)\/(\d+)(?:\/(\d+))?(?:\.\w+)?$/))) {
    return pictwo.image.byCategory(m[1].toLowerCase(), { seed: extractSeed(query), ...dims(m[2], m[3]), format })
  }
  if ((m = args.match(/^(\d+)(?:\/(\d+))?(?:\.\w+)?$/))) {
    return pictwo.image.url({ seed: extractSeed(query), ...dims(m[1], m[2]), format })
  }

  throw new Error('Invalid URL format')
}
