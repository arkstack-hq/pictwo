import path, { basename, extname } from 'node:path'

import { Image } from 'src/Utils/Image'
import { readdir } from 'node:fs/promises'

export class ImageService {
    categories = new Map<string, Set<Image>>()
    directories = new Set<string>()
    private static readonly IMAGE_EXTENSIONS = new Set([
        '.jpg', '.jpeg', '.png', '.webp', '.avif',
        '.gif', '.tiff', '.tif', '.bmp', '.svg', '.heic', '.heif',
    ])

    private static instance: ImageService

    static async init () {
        const service = new ImageService()
        const root = config('filesystem.disks.public.root', '')!
        const imagesRoot = path.join(root, '/images')

        const files = await readdir(imagesRoot, {
            recursive: true,
            withFileTypes: true,
        })

        for (const file of files) {
            if (!file.isFile()) continue
            if (!ImageService.isImage(file.name)) continue  // skip non-images

            const isTopLevel = file.parentPath === imagesRoot ||
                file.parentPath.endsWith('/images')

            const category = isTopLevel ? null : basename(file.parentPath)
            const filePath = path.join(file.parentPath, file.name)

            const meta = new Image({
                name: file.name,
                path: filePath,
                category,
                format: extname(file.name).replace('.', ''),
            })

            if (category) {
                if (!service.categories.has(category)) {
                    service.categories.set(category, new Set())
                }
                service.categories.get(category)!.add(meta)
                service.directories.add(file.parentPath)
            }
        }

        ImageService.instance = service

        return service
    }

    private static isImage (filename: string): boolean {
        return ImageService.IMAGE_EXTENSIONS.has(extname(filename).toLowerCase())
    }

    static getInstance () {
        return this.instance
    }

    /**
     * Returns all image metadata across all categories.
     */
    getAllFiles (): Image[] {
        const all: Image[] = []
        for (const files of this.categories.values()) {
            all.push(...files)
        }

        return all
    }

    /**
     * Returns metadata for a single image by path or filename.
     */
    getFile (filePath: string): Image | undefined {
        for (const files of this.categories.values()) {
            for (const meta of files) {
                if (meta.path === filePath || meta.name === filePath) {
                    return meta
                }
            }
        }
    }

    /**
     * Returns all images in a given category.
     */
    getCategory (category: string): Image[] {
        return [...(this.categories.get(category) ?? [])]
    }

    /**
     * Returns names of all discovered categories.
     */
    getCategoryNames (): string[] {
        return Array.from(this.categories.keys())
    }
}