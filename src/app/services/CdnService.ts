import type { ImageManifest, Pictwo } from '@pictwo/core'

import { createPictwo } from '@pictwo/core'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)

/**
 * Lazily builds and caches a jsDelivr-backed {@link Pictwo} instance from the
 * installed `@pictwo/images` package (its `manifest.json` + version). Used by
 * the `?cd` route to resolve CDN URLs without any runtime image processing.
 */
export class CdnService {
    private static instance: Pictwo | null = null

    static get (): Pictwo {
        if (CdnService.instance) return CdnService.instance

        const packageName = String(config('cdn.package', '@pictwo/images'))
        const baseUrl = String(config('cdn.baseUrl', 'https://cdn.jsdelivr.net/npm'))
        const version = String(config('cdn.version', '') || CdnService.readVersion(packageName))
        const manifest = CdnService.readManifest(packageName)

        CdnService.instance = createPictwo({
            source: { driver: 'jsdelivr', packageName, version, baseUrl },
            manifest,
        })

        return CdnService.instance
    }

    /** Whether `?cd` delivery is enabled (config + a usable manifest). */
    static enabled (): boolean {
        return Boolean(config('cdn.enabled', true))
    }

    private static readManifest (packageName: string): ImageManifest {
        const file = require.resolve(`${packageName}/manifest.json`)

        return JSON.parse(readFileSync(file, 'utf-8')) as ImageManifest
    }

    private static readVersion (packageName: string): string {
        try {
            const file = require.resolve(`${packageName}/package.json`)

            return (JSON.parse(readFileSync(file, 'utf-8')).version as string) ?? '0.0.0'
        } catch {
            return '0.0.0'
        }
    }
}
