import { createFakerImage, pictwoImage } from '../src'
import { describe, expect, it } from 'vitest'

describe('faker extension (hosted default)', () => {
  const image = pictwoImage()

  it('defaults to the hosted host', () => {
    expect(image.url()).toBe('https://pictwo.toneflix.net/640/480')
  })

  it('maps avatar() to the avatar category', () => {
    expect(image.avatar()).toBe('https://pictwo.toneflix.net/category/avatar/128/128')
  })

  it('maps category shortcuts', () => {
    expect(image.fashion()).toBe('https://pictwo.toneflix.net/category/fashion/640/480')
    expect(image.fabric()).toBe('https://pictwo.toneflix.net/category/fabric/640/480')
    expect(image.product()).toBe('https://pictwo.toneflix.net/category/product/640/480')
    expect(image.design()).toBe('https://pictwo.toneflix.net/category/design/640/480')
  })

  it('maps urlPicsumPhotos() to the plain size route', () => {
    expect(image.urlPicsumPhotos({ width: 300, height: 200 }))
      .toBe('https://pictwo.toneflix.net/300/200')
  })

  it('maps urlLoremFlickr() to the /images route', () => {
    expect(image.urlLoremFlickr({ category: 'fashion', width: 320, height: 240 }))
      .toBe('https://pictwo.toneflix.net/images/fashion?w=320&h=240')
  })

  it('translates faker-style grayscale/blur into filters', () => {
    expect(image.urlPicsumPhotos({ width: 100, height: 100, grayscale: true, blur: 4 }))
      .toBe('https://pictwo.toneflix.net/100/100?filters=greyscale,blur:4')
  })

  it('honours custom default dimensions', () => {
    const big = createFakerImage({ width: 1000, height: 800 })
    expect(big.fashion()).toBe('https://pictwo.toneflix.net/category/fashion/1000/800')
  })

  it('exposes a method for every shipped category, including hyphenated slugs', () => {
    expect(image.africanFashion())
      .toBe('https://pictwo.toneflix.net/category/african-fashion/640/480')
    expect(image.technology({ width: 300, height: 300 }))
      .toBe('https://pictwo.toneflix.net/category/technology/300/300')
    expect(image.nature()).toBe('https://pictwo.toneflix.net/category/nature/640/480')
  })

  it('throws a clear error for unsupported methods', () => {
    expect(() => (image as unknown as { dataUri: () => string }).dataUri())
      .toThrow(/Not implemented: image\.dataUri/)
  })
})

describe('faker extension (custom host)', () => {
  it('respects a custom hosted baseUrl', () => {
    const image = pictwoImage({ source: { driver: 'hosted', baseUrl: 'https://img.example.com' } })
    expect(image.fashion()).toBe('https://img.example.com/category/fashion/640/480')
    expect(image.urlLoremFlickr({ category: 'avatar' }))
      .toBe('https://img.example.com/images/avatar?w=640&h=480')
  })
})
