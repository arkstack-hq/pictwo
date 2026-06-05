import { Image } from 'src/Utils/Image'
import { ImageService } from './ImageService'
import path from 'node:path'

export class ImageServiceProvider {
    private static instance: ImageService

    static async get () {
        if (!ImageServiceProvider.instance) {
            ImageServiceProvider.instance = await ImageService.init()
        }

        return ImageServiceProvider.instance
    }

    static fileId (img: Image): string {
        return path.basename(img.name, path.extname(img.name))
    }

    static findById (all: Image[], id: string): Image | undefined {
        return all.find(img => ImageServiceProvider.fileId(img) === id)
    }

    static seedIndex (seed: string, total: number): number {
        let hash = 0
        for (let i = 0; i < seed.length; i++) {
            hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0
        }

        return Math.abs(hash) % total
    }

    static toListItem (img: Image, baseUrl: string) {
        const id = ImageServiceProvider.fileId(img)

        return {
            id,
            url: `${baseUrl}/id/${id}/info`,
            width: img.width ?? 800,
            height: img.height ?? 600,
            category: img.category ?? 'Unknown',
            download_url: `${baseUrl}/id/${id}/800/600`,
        }
    }
}