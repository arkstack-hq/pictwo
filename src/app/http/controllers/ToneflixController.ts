import { ImageFilter, ImageFormat } from 'src/types/core'

import { BaseController } from '@controllers/BaseController'
import { HttpContext } from 'clear-router/types/express'
import { Image } from 'src/Utils/Image'
import { ImageServiceProvider } from 'src/app/services/ImageServiceProvider'

/**
 * Lorem Toneflix–compatible controller.
 *
 * Routes (register these in your router):
 *
 *   GET /images                         → random image
 *   GET /images/:category               → random from category  (e.g. /images/avatar)
 *   GET /images/image/:id               → specific image by file ID
 *
 * Query params:
 *   ?w=N &h=N          Output dimensions (default 800 × 600)
 *   ?filters=f1,f2:v   Comma-separated filter list — see resolveFilters()
 *   ?text=true|string  Overlay text; `true` → filename; any string → custom label
 *   ?seed=*            Any unknown param seeds deterministic randomisation
 *   ?format=webp|avif|png|jpeg
 */
export default class ToneflixController extends BaseController {

    async show({ req, res }: HttpContext) {
        const service = await ImageServiceProvider.get()
        const all = service.getAllFiles()

        if (!all.length) {
            return res.status(404).json({ error: 'No images available' })
        }

        // `/images/*segments` or named `:segment`
        const raw: string[] = Array.isArray(req.params.segments)
            ? req.params.segments
            : req.params.segments
                ? [req.params.segments]
                : []

        const segments = raw.flatMap(s => s.split('/')).filter(Boolean)

        const width = Math.max(1, Number(req.query.w ?? req.query.width ?? 800) || 800)
        const height = Math.max(1, Number(req.query.h ?? req.query.height ?? 600) || 600)
        const format = ToneflixController.resolveFormat(req.query.format as string ?? '')

        let pool: Image[] = all
        let label: string | undefined
        let image: Image | undefined

        if (segments[0] === 'image' && segments[1]) {
            // /images/image/{id}
            image = ImageServiceProvider.findById(all, segments[1])
            if (!image) {
                return res.status(404).json({ error: `Image '${segments[1]}' not found` })
            }
        } else if (segments[0]) {
            // /images/{category}
            const cat = segments[0]
            pool = service.getCategory(cat)
            if (!pool.length) {
                return res.status(404).json({ error: `Category '${cat}' not found or has no images` })
            }
        }

        if (!image) {
            const seed = ToneflixController.extractSeed(req.query as Record<string, string>)
            const idx = seed !== null
                ? ImageServiceProvider.seedIndex(seed, pool.length)
                : Math.floor(Math.random() * pool.length)
            image = pool[idx]
        }

        const textParam = req.query.text as string | undefined
        if (textParam) {
            label = textParam === 'true' ? ImageServiceProvider.fileId(image) : textParam
        }

        const { filters, blurSigma } = ToneflixController.resolveFilters(
            req.query as Record<string, string>
        )

        const { buffer: rawBuf, headers } = await image.toResponse({
            font: (req.query.font as string) ?? 'serif',
            label,
            format,
            resize: { mode: 'cover', width, height },
            filters,
            blurSigma,
        })

        res.setHeader('Picsum-ID', ImageServiceProvider.fileId(image))
        res.setHeader('X-Image-Category', image.category ?? 'uncategorised')
        Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))
        res.end(rawBuf)
    }

    private static resolveFormat(hint: string): ImageFormat {
        const ext = (hint ?? '').replace(/^\./, '').toLowerCase()
        if (ext === 'jpg' || ext === 'jpeg') return 'jpeg'
        if (ext === 'webp' || ext === 'avif' || ext === 'png') return ext

        return 'jpeg'
    }

    /**
     * Parses ?filters=f1,f2:v  (Toneflix style) into a shape / blurSigma pair.
     *
     * Supported tokens:
     *   blur[:sigma]   greyscale | grayscale   invert   sharpen
     *   normalize      flip                    flop
     *   pixelate[:n]   — silently ignored (not native to sharp)
     * 
     * @param query 
     * @returns 
     */
    static resolveFilters(query: Record<string, string | string[]>): {
        filters: ImageFilter[]
        blurSigma?: number
    } {
        const filters: ImageFilter[] = []
        let blurSigma: number | undefined

        const raw = Array.isArray(query.filters) ? query.filters.join(',') : (query.filters ?? '').trim()
        if (!raw) return { filters, blurSigma }

        for (const token of raw.split(',')) {
            const [name, val] = token.trim().split(':')
            switch (name.toLowerCase()) {
                case 'blur': {
                    const sigma = val ? Math.min(Math.max(Number(val), 1), 100) : 2
                    if (!filters.includes('blur')) {
                        filters.push('blur'); blurSigma = sigma
                    }
                    break
                }
                case 'greyscale':
                case 'grayscale':
                    if (!filters.includes('greyscale')) filters.push('greyscale')
                    break
                case 'invert':
                    if (!filters.includes('negate')) filters.push('negate')
                    break
                case 'sharpen':
                    if (!filters.includes('sharpen')) filters.push('sharpen')
                    break
                case 'normalize':
                case 'normalise':
                    if (!filters.includes('normalize')) filters.push('normalize')
                    break
                case 'flip':
                    if (!filters.includes('flip')) filters.push('flip')
                    break
                case 'flop':
                    if (!filters.includes('flop')) filters.push('flop')
                    break
                // pixelate: gracefully ignored
            }
        }

        return { filters, blurSigma }
    }

    /**
     * Any query param that isn't a reserved keyword acts as a seed.
     * Returns null when no seeding params are present (→ true random).
     * 
     * @param query 
     * @returns 
     */
    static extractSeed(query: Record<string, string>): string | null {
        const RESERVED = new Set([
            'w', 'h', 'width', 'height', 'filters', 'text', 'font',
            'grayscale', 'greyscale', 'blur', 'random', 'format', 'cdn',
        ])
        const keys = Object.keys(query).filter(k => !RESERVED.has(k))
        if (!keys.length) return null

        return keys.map(k => `${k}=${query[k]}`).join('&')
    }
}