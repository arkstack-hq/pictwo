import { BaseController } from './BaseController'
import { HttpContext } from 'clear-router/types/express'
import { ImageServiceProvider } from 'src/app/services/ImageServiceProvider'

/**
 * Handles paginated image listing.
 *
 * GET /v1/list
 * GET /v1/list?page=2&limit=100
 */
export default class ImageListController extends BaseController {
    async index ({ req, res }: HttpContext) {
        const service = await ImageServiceProvider.get()
        const all = service.getAllFiles()

        const page = Number(req.query.page ?? 1)
        const limit = Math.min(Number(req.query.limit ?? 30), 100)
        const start = (page - 1) * limit
        const slice = all.slice(start, start + limit)
        const totalPages = Math.ceil(all.length / limit)
        const baseUrl = `${req.protocol}://${req.get('host')}`

        res.setHeader('Link', [
            page > 1
                ? `<${baseUrl}/v2/list?page=${page - 1}&limit=${limit}>; rel="prev"`
                : null,
            page < totalPages
                ? `<${baseUrl}/v2/list?page=${page + 1}&limit=${limit}>; rel="next"`
                : null,
        ].filter(Boolean).join(', '))

        return res.json(slice.map(img => ImageServiceProvider.toListItem(img, baseUrl)))
    }
}