import { BaseController } from './BaseController'
import { HttpContext } from 'clear-router/types/express'
import { ImageServiceProvider } from 'src/app/services/ImageServiceProvider'
import { RequestException } from '@arkstack/common'
import { Resource } from 'resora'

/**
 * Handles image metadata endpoints.
 *
 * GET /api/v1/id/:id/info
 * GET /api/v1/seed/:seed/info
 */
export default class ImageInfoController extends BaseController {
    async showById ({ req }: HttpContext) {
        const service = await ImageServiceProvider.get()
        const all = service.getAllFiles()
        const img = ImageServiceProvider.findById(all, String(req.params.id))

        RequestException.assertFound(img, 'Image not found', 404)

        const baseUrl = `${config('app.url')}/api/v1`

        return new Resource(ImageServiceProvider.toListItem(img, baseUrl))
    }

    async showBySeed ({ req }: HttpContext) {
        const service = await ImageServiceProvider.get()
        const all = service.getAllFiles()
        const idx = ImageServiceProvider.seedIndex(String(req.params.seed), all.length)
        const img = all[idx]
        const baseUrl = `${config('app.url')}/api/v1`

        return new Resource(ImageServiceProvider.toListItem(img, baseUrl))
    }
}
