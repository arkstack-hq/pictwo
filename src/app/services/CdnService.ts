import type { ImageManifest, Pictwo } from '@pictwo/core'

import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)

/**
 * Lazily builds and caches a jsDelivr-backed {@link Pictwo} instance from the
 * installed `@pictwo/images` package (its `manifest.json` + version). Used by
 * the `?cdn` route to resolve CDN URLs without any runtime image processing.
 *
 * `@pictwo/core` is imported dynamically (not at module load) so that a missing
 * or unbuilt CDN dependency only disables `?cdn` — it can never break importing
 * this module, and therefore never silently drops the web routes that depend on
 * it (the router loads route files behind a swallow-all try/catch).
 */
export class CdnService {
    private static instance: Pictwo | null = null

    static async get (): Promise<Pictwo> {
        if (CdnService.instance) return CdnService.instance

        const { createPictwo } = await import('@pictwo/core')
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
