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
    expect(jsdelivr.image.fashion({ seed: 'pick' }))
      .toBe('https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/images/fashion/original/model-001.jpg')
  })

  it('returns a generated variant when a matching size exists', () => {
    expect(jsdelivr.image.fashion({ seed: 'pick', width: 400, height: 400 }))
      .toBe('https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/images/fashion/400x400/model-001.webp')
  })

  it('resolves size presets to variant folders', () => {
    expect(jsdelivr.image.fashion({ seed: 'pick', size: 'card' }))
      .toBe('https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/images/fashion/400x400/model-001.webp')
  })
})

describe('local provider URL generation', () => {
  it('returns the original asset', () => {
    expect(local.image.fashion({ seed: 'pick' }))
      .toBe('/pictwo/images/fashion/original/model-001.jpg')
  })

  it('returns a variant asset', () => {
    expect(local.image.fashion({ seed: 'pick', width: 400, height: 400 }))
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
    const idx = seedIndex('pick', manifest.categories.fashion.original.length)
    const expected = manifest.categories.fashion.original[idx]
    expect(local.image.fashion({ seed: 'pick' }))
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
    expect(local.image.fashion({ seed: 'pick', width: 999, height: 999 }))
      .toBe('/pictwo/images/fashion/original/model-001.jpg')
  })

  it('throws when fallback is "throw" and the variant is missing', () => {
    expect(() => local.image.fashion({ seed: 'pick', width: 999, height: 999, fallback: 'throw' }))
      .toThrow(/No "999x999" variant/)
  })
})

describe('jsDelivr nearest-dimension resolution', () => {
  it('snaps an unsupported size to the nearest available variant', () => {
    // fashion has 400x400 and 128x128; 300x300 is nearest to 400x400
    expect(jsdelivr.image.fashion({ seed: 'pick', width: 300, height: 300 }))
      .toBe('https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/images/fashion/400x400/model-001.webp')
  })

  it('snaps to the smaller variant when it is closer', () => {
    // 130x130 is nearest to 128x128
    expect(jsdelivr.image.fashion({ seed: 'pick', width: 130, height: 130 }))
      .toBe('https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/images/fashion/128x128/model-001.webp')
  })

  it('local provider keeps the original by default (no nearest snapping)', () => {
    expect(local.image.fashion({ seed: 'pick', width: 300, height: 300 }))
      .toBe('/pictwo/images/fashion/original/model-001.jpg')
  })

  it('local provider can opt into nearest snapping', () => {
    expect(local.image.fashion({ seed: 'pick', width: 300, height: 300, fallback: 'nearest' }))
      .toBe('/pictwo/images/fashion/400x400/model-001.webp')
  })
})

describe('static provider error handling', () => {
  it('requires a manifest', () => {
    const noManifest = createPictwo({ source: { driver: 'local' } })
    expect(() => noManifest.image.fashion())
      .toThrow(/requires a manifest/)
  })

  it('throws on an unknown category', () => {
    expect(() => local.image.byCategory('does-not-exist'))
      .toThrow(/Unknown category/)
  })
})
