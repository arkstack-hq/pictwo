import { createPictwo, seedIndex } from '../src'
import { describe, expect, it } from 'vitest'

import { manifest } from './fixtures'

const jsdelivr = createPictwo({
  source: { driver: 'jsdelivr', packageName: '@pictwo/images', version: '1.0.0' },
  manifest,
})

const local = createPictwo({
  source: { driver: 'local', baseUrl: '/pictwo/images' },
  manifest,
})

describe('jsDelivr provider URL generation', () => {
  it('returns the original asset when no size is requested', () => {
    expect(jsdelivr.image.fashion({ seed: 'home-card' }))
      .toBe('https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/images/fashion/original/model-001.jpg')
  })

  it('returns a generated variant when a matching size exists', () => {
    expect(jsdelivr.image.fashion({ seed: 'home-card', width: 400, height: 400 }))
      .toBe('https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/images/fashion/400x400/model-001.webp')
  })

  it('resolves size presets to variant folders', () => {
    expect(jsdelivr.image.fashion({ seed: 'home-card', size: 'card' }))
      .toBe('https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/images/fashion/400x400/model-001.webp')
  })
})

describe('local provider URL generation', () => {
  it('returns the original asset', () => {
    expect(local.image.fashion({ seed: 'home-card' }))
      .toBe('/pictwo/images/fashion/original/model-001.jpg')
  })

  it('returns a variant asset', () => {
    expect(local.image.fashion({ seed: 'home-card', width: 400, height: 400 }))
      .toBe('/pictwo/images/fashion/400x400/model-001.webp')
  })
})

describe('seeded vs random static selection', () => {
  it('same seed + same category selects the same image', () => {
    const a = local.image.fashion({ seed: 'repeat' })
    const b = local.image.fashion({ seed: 'repeat' })
    expect(a).toBe(b)
  })

  it('uses the shared deterministic seed hash', () => {
    const idx = seedIndex('home-card', manifest.categories.fashion.original.length)
    const expected = manifest.categories.fashion.original[idx]
    expect(local.image.fashion({ seed: 'home-card' }))
      .toBe(`/pictwo/images/fashion/original/${expected}`)
  })

  it('random selection (no seed) returns a valid asset', () => {
    const url = local.image.fashion()
    expect(url).toMatch(/^\/pictwo\/images\/fashion\/original\/model-00\d\.jpg$/)
  })

  it('selects by id', () => {
    expect(local.image.byId('model-002', { category: 'fashion' } as never))
      .toContain('/fashion/original/model-002.jpg')
  })
})

describe('fallback behaviour for missing variants', () => {
  it('falls back to the original when a specific image lacks the variant', () => {
    // fabric has a 400x400 variant only for weave-001, not weave-002
    expect(local.image.byId('weave-002', { category: 'fabric', width: 400, height: 400 } as never))
      .toBe('/pictwo/images/fabric/original/weave-002.jpg')
  })

  it('uses the variant when the specific image has one', () => {
    expect(local.image.byId('weave-001', { category: 'fabric', width: 400, height: 400 } as never))
      .toBe('/pictwo/images/fabric/400x400/weave-001.webp')
  })

  it('falls back to original for a size with no variant folder', () => {
    expect(local.image.fashion({ seed: 'home-card', width: 999, height: 999 }))
      .toBe('/pictwo/images/fashion/original/model-001.jpg')
  })

  it('throws when fallback is "throw" and the variant is missing', () => {
    expect(() => local.image.fashion({ seed: 'home-card', width: 999, height: 999, fallback: 'throw' }))
      .toThrowError(/No "999x999" variant/)
  })
})

describe('static provider error handling', () => {
  it('requires a manifest', () => {
    const noManifest = createPictwo({ source: { driver: 'local' } })
    expect(() => noManifest.image.fashion())
      .toThrowError(/requires a manifest/)
  })

  it('throws on an unknown category', () => {
    expect(() => local.image.byCategory('does-not-exist'))
      .toThrowError(/Unknown category/)
  })
})
