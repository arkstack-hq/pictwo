import { DEFAULT_PICTWO_HOST, createPictwo, pictwo } from '../src'
import { describe, expect, it } from 'vitest'

describe('hosted provider URL generation', () => {
  it('defaults to the hosted provider and host', () => {
    expect(pictwo.config.source).toEqual({ driver: 'hosted', baseUrl: DEFAULT_PICTWO_HOST })
  })

  it('generates a plain size route', () => {
    expect(pictwo.image.url({ width: 800, height: 600 }))
      .toBe('https://pictwo.toneflix.net/800/600')
  })

  it('generates a category route', () => {
    expect(pictwo.image.avatar({ width: 200, height: 200 }))
      .toBe('https://pictwo.toneflix.net/category/avatar/200/200')
  })

  it('appends a seed query on category routes', () => {
    expect(pictwo.image.fashion({ width: 800, height: 600, seed: 'home-card' }))
      .toBe('https://pictwo.toneflix.net/category/fashion/800/600?seed=home-card')
  })

  it('generates an id route', () => {
    expect(pictwo.image.byId('20001', { width: 400, height: 300 }))
      .toBe('https://pictwo.toneflix.net/id/20001/400/300')
  })

  it('generates a dedicated seed route', () => {
    expect(pictwo.image.seed('hero', { width: 1200, height: 600 }))
      .toBe('https://pictwo.toneflix.net/seed/hero/1200/600')
  })

  it('supports format extensions', () => {
    expect(pictwo.image.url({ width: 800, height: 600, format: 'webp' }))
      .toBe('https://pictwo.toneflix.net/800/600.webp')
  })

  it('supports filters through query params', () => {
    expect(pictwo.image.url({ width: 800, height: 600, filters: ['greyscale', 'blur:4'] }))
      .toBe('https://pictwo.toneflix.net/800/600?filters=greyscale,blur:4')
  })

  it('combines category seed and filters', () => {
    expect(pictwo.image.fashion({ width: 400, height: 400, seed: 's', filters: ['greyscale'] }))
      .toBe('https://pictwo.toneflix.net/category/fashion/400/400?seed=s&filters=greyscale')
  })

  it('resolves size presets', () => {
    expect(pictwo.image.url({ size: 'og' }))
      .toBe('https://pictwo.toneflix.net/1200/630')
  })

  it('honours a custom host', () => {
    const custom = createPictwo({ source: { driver: 'hosted', baseUrl: 'https://img.example.com' } })
    expect(custom.image.url({ width: 100, height: 100 }))
      .toBe('https://img.example.com/100/100')
  })
})

describe('current hosted API route compatibility', () => {
  const cases: Array<[string, string]> = [
    [pictwo.image.url({ width: 200 }), '/200/200'],
    [pictwo.image.url({ width: 200, height: 100 }), '/200/100'],
    [pictwo.image.url({ width: 200, height: 100, format: 'webp' }), '/200/100.webp'],
    [pictwo.image.byId('42', { width: 200, height: 100 }), '/id/42/200/100'],
    [pictwo.image.seed('foo', { width: 200, height: 100 }), '/seed/foo/200/100'],
    [pictwo.image.byCategory('nature', { width: 200, height: 100 }), '/category/nature/200/100'],
  ]

  it('matches the live route shapes', () => {
    for (const [url, path] of cases) {
      expect(url).toBe(DEFAULT_PICTWO_HOST + path)
    }
  })
})
