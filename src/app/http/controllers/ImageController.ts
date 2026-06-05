import { BaseController } from '@controllers/BaseController'
import { HttpContext } from 'clear-router/types/express'
import { Image } from 'src/Utils/Image'
import { ImageServiceProvider } from 'src/app/services/ImageServiceProvider'
import { MakeOptions } from 'src/types/core'

/**
 * GET /{width}
 * GET /{width}/{height}
 * GET /{width}/{height}.jpg|.webp|.png|.avif
 * GET /id/{id}/{width}/{height}
 * GET /seed/{seed}/{width}/{height}
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
    const service = await ImageServiceProvider.get()
    const all = service.getAllFiles()

    if (!all.length) {
      return res.status(404).json({ error: 'No images available' })
    }

    const args = (Array.isArray(req.params.args)
      ? req.params.args.join('/')
      : req.params.args ?? ''
    ).replace(/^\//, '')

    const resolved = ImageController.resolveImage(args, all)

    if (!resolved) {
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    const { image, width, height, format } = resolved
    const filters: MakeOptions['filters'] = []

    if ('grayscale' in req.query) filters.push('greyscale')

    const blurAmount = req.query.blur
      ? Math.min(Math.max(Number(req.query.blur), 1), 10)
      : undefined

    if (blurAmount) filters.push('blur')

    const { buffer, headers } = await image.toResponse({
      format,
      resize: { mode: 'cover', width, height },
      filters,
      blurSigma: blurAmount,
    })

    res.setHeader('Picsum-ID', ImageServiceProvider.fileId(image))
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))
    res.end(buffer)
  }

  private static resolveFormat (args: string): MakeOptions['format'] {
    const ext = args.match(/\.(jpg|jpeg|webp|png|avif)$/)?.[1]
    if (!ext) return 'jpeg'

    return (ext === 'jpg' ? 'jpeg' : ext) as MakeOptions['format']
  }

  private static resolveImage (
    args: string,
    all: Image[]
  ): { image: Image; width: number; height: number; format: MakeOptions['format'] } | null {
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
}