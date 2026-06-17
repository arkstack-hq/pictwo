import { describe, expect, it } from 'vitest'

import { createPictwo } from '@pictwo/core'
import type { ImageManifest } from '@pictwo/core'
import { resolveCdnUrl } from '../src/app/services/cdnResolver'

const manifest: ImageManifest = {
    version: 1,
    categories: {
        fashion: {
            original: ['model-001.jpg', 'model-002.jpg', 'model-003.jpg'],
            variants: {
                '400x400': ['model-001.webp', 'model-002.webp', 'model-003.webp'],
                '128x128': ['model-001.webp', 'model-002.webp', 'model-003.webp'],
            },
        },
    },
}

const pictwo = createPictwo({
    source: { driver: 'jsdelivr', packageName: '@pictwo/images', version: '1.0.0' },
    manifest,
})

const BASE = 'https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/img'

const VARIANT_400 = new RegExp(`^${BASE}/fashion/400x400/model-00\\d\\.webp$`)

describe('?cdn url resolution', () => {
    it('resolves a category route to a 400x400 variant url', () => {
        expect(resolveCdnUrl(pictwo, 'category/fashion/400/400', { seed: 'pick' }))
            .toMatch(VARIANT_400)
    })

    it('snaps an unsupported size to the nearest variant', () => {
        expect(resolveCdnUrl(pictwo, 'category/fashion/300/300', { seed: 'pick' }))
            .toMatch(VARIANT_400)
    })

    it('resolves an id route (hyphenated ids allowed) to the matching variant', () => {
        expect(resolveCdnUrl(pictwo, 'id/model-002/128/128', {}))
            .toBe(`${BASE}/fashion/128x128/model-002.webp`)
    })

    it('resolves a seed route', () => {
        const url = resolveCdnUrl(pictwo, 'seed/hero/400/400', {})
        expect(url).toMatch(VARIANT_400)
    })

    it('seeds deterministically and excludes the cdn flag from the seed', () => {
        const withFlag = resolveCdnUrl(pictwo, '400/400', { cdn: '', seed: 'pick' })
        const without = resolveCdnUrl(pictwo, '400/400', { seed: 'pick' })
        expect(withFlag).toBe(without)
        expect(withFlag).toMatch(VARIANT_400)
    })

    it('throws on an unrecognised route', () => {
        expect(() => resolveCdnUrl(pictwo, 'not/a/real/route', {}))
            .toThrowError(/Invalid URL format/)
    })
})
