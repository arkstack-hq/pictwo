import { ImageFilter, ImageFormat } from 'src/types/core'

import { BaseController } from '@controllers/BaseController'
import { HttpContext } from 'clear-router/types/express'
import { Image } from 'src/Utils/Image'
import { ImageServiceProvider } from 'src/app/services/ImageServiceProvider'
import { RequestException } from '@arkstack/common'
import ToneflixController from './ToneflixController'

/**
 * GET /{width}
 * GET /{width}/{height}
 * GET /{width}/{height}.jpg|.webp|.png|.avif
 * GET /id/{id}/{width}/{height}
 * GET /seed/{seed}/{width}/{height}
 * GET /category/{category}/{width}/{height}
 *
 * ?grayscale   Greyscale filter
 * ?blur=1-10   Blur with optional level
 * ?random={n}  Cache-busting (no-op)
 */
export default class ImageController extends BaseController {
  /**
   * Get a specific resource
   *
   * @param res
   */
  async show ({ req, res }: HttpContext) {
    const args = (Array.isArray(req.params.args)
      ? req.params.args.join('/')
      : req.params.args ?? ''
    ).replace(/^\//, '')

    const byCategory = args.match(/^category\/([^/]+)\/(\d+)(?:\/(\d+))?(?:\.\w+)?$/)
    const service = await ImageServiceProvider.get()

    const all = byCategory
      ? service.getCategory(byCategory[1].toLowerCase())
      : service.getAllFiles()

    if (!all.length) {
      return res.status(404).json({ error: 'No images available' })
    }

    const query = req.query as Record<string, string>
    const resolved = ImageController.resolveImage(args, all, query)

    RequestException.assertFound(resolved, 'Invalid URL format', 400)

    const { image, width, height, format } = resolved

    // Merge Picsum-style params (?grayscale, ?blur) + Toneflix ?filters=
    const { filters, blurSigma } = ImageController.mergeFilters(query)

    if ('grayscale' in req.query) filters.push('greyscale')

    const { buffer, headers } = await image.toResponse({
      format,
      resize: { mode: 'cover', width, height },
      filters,
      blurSigma,
    })

    res.setHeader('Picsum-ID', ImageServiceProvider.fileId(image))
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))
    res.end(buffer)
  }

  private static resolveFormat (args: string): ImageFormat {
    const ext = args.match(/\.(jpg|jpeg|webp|png|avif)$/)?.[1]
    if (!ext) return 'jpeg'

    return (ext === 'jpg' ? 'jpeg' : ext) as ImageFormat
  }

  private static resolveImage (
    args: string,
    all: Image[],
    query: Record<string, string> = {},
  ): { image: Image; width: number; height: number; format: ImageFormat } | null {
    const format = ImageController.resolveFormat(args)

    // /id/{id}/{width}/{height}
    const byId = args.match(/^id\/(\w+)\/(\d+)(?:\/(\d+))?(?:\.\w+)?$/)
    if (byId) {
      const image = ImageServiceProvider.findById(all, byId[1])
      if (!image) return null
      const width = Number(byId[2])
      const height = byId[3] ? Number(byId[3]) : width

      return { image, width, height, format }
    }

    // /seed/{seed}/{width}/{height}
    const bySeed = args.match(/^seed\/([^/]+)\/(\d+)(?:\/(\d+))?(?:\.\w+)?$/)
    if (bySeed) {
      const idx = ImageServiceProvider.seedIndex(bySeed[1], all.length)
      const image = all[idx]
      const width = Number(bySeed[2])
      const height = bySeed[3] ? Number(bySeed[3]) : width

      return { image, width, height, format }
    }

    // /category/{category}/{width}/{height}
    const byCategory = args.match(/^category\/([^/]+)\/(\d+)(?:\/(\d+))?(?:\.\w+)?$/)
    if (byCategory) {
      if (!all.length) return null
      const seed = ToneflixController.extractSeed(query)
      const idx = seed !== null
        ? ImageServiceProvider.seedIndex(seed, all.length)
        : Math.floor(Math.random() * all.length)

      return {
        image: all[idx], width: Number(byCategory[2]), height: byCategory[3]
          ? Number(byCategory[3])
          : Number(byCategory[2]), format
      }
    }


    // /{width}/{height} or /{width}
    const bySize = args.match(/^(\d+)(?:\/(\d+))?(?:\.\w+)?$/)
    if (bySize) {
      const image = all[Math.floor(Math.random() * all.length)]
      const width = Number(bySize[1])
      const height = bySize[2] ? Number(bySize[2]) : width

      return { image, width, height, format }
    }

    return null
  }


  /**
   * Combines Picsum-style individual params (?grayscale, ?blur=N) with the
   * Toneflix ?filters= string so both conventions work on every Picsum route.
   * 
   * @param query 
   * @returns 
   */
  private static mergeFilters (query: Record<string, string>): {
    filters: ImageFilter[]
    blurSigma?: number
  } {
    // Start with ?filters= (shared helper from ToneflixController)
    const { filters, blurSigma: toneBlur } = ToneflixController.resolveFilters(query)
    console.log(filters)
    if (!filters) return { filters: [] }

    // Layer Picsum-style params on top
    if (('grayscale' in query || 'greyscale' in query) && !filters.includes('greyscale')) {
      filters.push('greyscale')
    }

    let blurSigma = toneBlur
    if (!blurSigma && query.blur) {
      const v = Math.min(Math.max(Number(query.blur), 1), 10)
      if (!filters.includes('blur')) {
        filters.push('blur'); blurSigma = v
      }
    }

    if (!filters) return { filters: [], blurSigma }

    return { filters, blurSigma }
  }
}