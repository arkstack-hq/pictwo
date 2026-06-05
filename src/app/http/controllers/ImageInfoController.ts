import { BaseController } from './BaseController'
import { HttpContext } from 'clear-router/types/express'
import { ImageServiceProvider } from 'src/app/services/ImageServiceProvider'

/**
 * Handles image metadata endpoints.
 *
 * GET /id/:id/info
 * GET /seed/:seed/info
 */
export default class ImageInfoController extends BaseController {
    async showById ({ req, res }: HttpContext) {
        const service = await ImageServiceProvider.get()
        const all = service.getAllFiles()
        const img = ImageServiceProvider.findById(all, String(req.params.id))

        if (!img) {
            return res.status(404).json({ error: 'Image not found' })
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`

        return res.json(ImageServiceProvider.toListItem(img, baseUrl))
    }

    async showBySeed ({ req, res }: HttpContext) {
        const service = await ImageServiceProvider.get()
        const all = service.getAllFiles()
        const idx = ImageServiceProvider.seedIndex(String(req.params.seed), all.length)
        const img = all[idx]
        const baseUrl = `${req.protocol}://${req.get('host')}`

        return res.json(ImageServiceProvider.toListItem(img, baseUrl))
    }
}
