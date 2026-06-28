import sharp, { type Sharp } from 'sharp'
import { MakeOptions, ImageFormat } from 'src/types/core'
import { font } from './font'

export class Image {
    name: string
    path: string
    format: string
    width?: number
    height?: number
    category: string | null

    constructor(
        options: {
            name: string,
            path: string,
            format: string,
            category: string | null,
            width?: number,
            height?: number
        }
    ) {
        this.name = options.name
        this.path = options.path
        this.format = options.format
        this.width = options.width
        this.height = options.height
        this.category = options.category
    }

    /**
     * Processes an image file and returns a Buffer.
     *
     * @param input     Absolute path to the source image.
     * @param options   Format, quality, resize mode, and filters.
     */
    async make(options: MakeOptions): Promise<Buffer>
    async make(input: string | MakeOptions, options: MakeOptions): Promise<Buffer>
    async make(input?: string | MakeOptions, options: MakeOptions = {}): Promise<Buffer> {
        if (input && typeof input !== 'string') {
            options = input
            input = this.path
        }

        const {
            format = 'jpeg',
            quality = 100,
            resize,
            filters = [],
            blurSigma = 2,
        } = options

        let pipeline: Sharp = sharp(input)

        // --- Resize ---
        if (resize) {
            switch (resize.mode) {
                case 'scale':
                    pipeline = pipeline.resize(resize.width, resize.height, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    break
                case 'cover':
                    // Crop to fill the exact dimensions — minimal pixel loss
                    pipeline = pipeline.resize(resize.width, resize.height, {
                        fit: 'cover',
                        position: sharp.strategy.attention, // smart crop focus
                    })
                    break
                case 'contain':
                    // Letterbox — preserve all pixels within bounds
                    pipeline = pipeline.resize(resize.width, resize.height, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 },
                    })
                    break
                case 'fill':
                    pipeline = pipeline.resize(resize.width, resize.height, {
                        fit: 'fill',
                    })
                    break
            }
        }

        // --- Filters ---
        for (const filter of filters) {
            switch (filter) {
                case 'greyscale': pipeline = pipeline.greyscale(); break
                case 'blur': pipeline = pipeline.blur(blurSigma); break
                case 'sharpen': pipeline = pipeline.sharpen(); break
                case 'negate': pipeline = pipeline.negate(); break
                case 'normalize': pipeline = pipeline.normalize(); break
                case 'flip': pipeline = pipeline.flip(); break
                case 'flop': pipeline = pipeline.flop(); break
            }
        }

        // --- Format & Quality ---
        switch (format) {
            case 'jpeg': pipeline = pipeline.jpeg({ quality, mozjpeg: true }); break
            case 'png': pipeline = pipeline.png({ quality }); break
            case 'webp': pipeline = pipeline.webp({ quality }); break
            case 'avif': pipeline = pipeline.avif({ quality }); break
        }

        return pipeline.toBuffer()
    }

    /**
     * Composites a centred label over an image buffer using an SVG overlay.
     * No dependencies beyond sharp (already in use).
     * 
     * @param buffer 
     * @param text 
     * @param width 
     * @param height 
     * @returns 
     */
    async overlayText(
        buffer: Buffer,
        text: string,
        width: number,
        height: number,
        fontName?: string,
    ): Promise<Buffer> {
        const fontSize = Math.max(16, Math.round(Math.min(width, height) * 0.07))
        const padX = Math.round(fontSize * 0.8)
        const padY = Math.round(fontSize * 0.5)
        const textWidth = text.length * fontSize * 0.55
        const bgW = Math.round(textWidth + padX * 2)
        const bgH = Math.round(fontSize + padY * 2)
        const x = Math.round((width - bgW) / 2)
        const y = Math.round((height - bgH) / 2)

        const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect x="${x}" y="${y}" width="${bgW}" height="${bgH}" rx="6" fill="rgba(0,0,0,0.55)"/>
            <style>
                text {
                font-family: ${font(fontName ?? 'serif')}
                font-size: ${fontSize}px;
                font-weight: bold;
                }
            </style>
          <text x="${width / 2}" y="${y + bgH / 2 + fontSize * 0.35}" 
                fill="white" text-anchor="middle">${text}</text>
        </svg>`

        return sharp(buffer)
            .composite([{ input: Buffer.from(svg), blend: 'over' }])
            .toBuffer()
    }

    /**
     * Convenience: process and write an image directly to a destination path.
     * 
     * @param input 
     * @param destination 
     * @param options 
     */
    async save(destination: string, options: MakeOptions = {}): Promise<void> {
        const buffer = await this.make(options)
        await sharp(buffer).toFile(destination)
    }

    /**
     * Processes an image and returns a Response-compatible object
     * for immediate rendering in an HTTP context.
     *
     * @param input     Absolute path to the source image.
     * @param options   Format, quality, resize mode, and filters.
     */
    async toResponse(options: MakeOptions = {}): Promise<{
        buffer: Buffer
        contentType: string
        headers: Record<string, string>
    }> {
        const format = options.format ?? 'jpeg'
        let buffer = await this.make(options)

        const contentTypeMap: Record<ImageFormat, string> = {
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
            avif: 'image/avif',
        }

        if (options.label) {
            buffer = await this.overlayText(
                buffer,
                options.label,
                options.resize?.width ?? 800,
                options.resize?.height ?? 600,
                options.font,
            )
        }

        const contentType = contentTypeMap[format]

        return {
            buffer,
            contentType,
            headers: {
                'Content-Type': contentType,
                'Content-Length': String(buffer.byteLength),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        }
    }
}