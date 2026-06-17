import {
  DEFAULT_PICTWO_HOST,
  createPictwo,
} from '@pictwo/core'
import type { ImageCategory, ImageOptions, PictwoConfig } from '@pictwo/core'

export interface FakerImageConfig extends PictwoConfig {
  /** Default output width for methods called without dimensions. */
  width?: number
  /** Default output height for methods called without dimensions. */
  height?: number
}

export interface FakerUrlOptions extends ImageOptions {
  /** Faker-style grayscale toggle (mapped to the `greyscale` filter). */
  grayscale?: boolean
  /** Faker-style blur level 1-10 (mapped to the `blur:N` filter). */
  blur?: number
}

export interface FakerFlickrOptions extends FakerUrlOptions {
  category?: ImageCategory
}

/** A Faker-compatible `image` module backed by Pictwo. */
export interface PictwoFakerImage {
  url (options?: FakerUrlOptions): string
  avatar (options?: ImageOptions): string
  fashion (options?: ImageOptions): string
  fabric (options?: ImageOptions): string
  product (options?: ImageOptions): string
  design (options?: ImageOptions): string
  urlPicsumPhotos (options?: FakerUrlOptions): string
  urlLoremFlickr (options?: FakerFlickrOptions): string
  /** Any unimplemented Faker image method throws a clear error. */
  [method: string]: (...args: never[]) => string
}

const DEFAULT_WIDTH = 640
const DEFAULT_HEIGHT = 480
const DEFAULT_AVATAR = 128

function hostFrom (config: FakerImageConfig): string {
  const source = config.source
  if (source && source.driver === 'hosted') return source.baseUrl ?? DEFAULT_PICTWO_HOST

  return DEFAULT_PICTWO_HOST
}

/** Translate Faker-style `grayscale`/`blur` options into Pictwo filters. */
function withPicsumFilters (options: FakerUrlOptions): ImageOptions {
  const { grayscale, blur, ...rest } = options
  const filters = [...(rest.filters ?? [])]
  if (grayscale) filters.push('greyscale')
  if (typeof blur === 'number') filters.push(`blur:${Math.min(Math.max(blur, 1), 10)}`)

  return filters.length ? { ...rest, filters } : rest
}

/**
 * Create a Faker `image` module backed by Pictwo.
 *
 * @example
 * import { faker } from '@faker-js/faker'
 * import { pictwoImage } from '@pictwo/faker'
 *
 * export const fake = { ...faker, image: pictwoImage() }
 */
export function createFakerImage (config: FakerImageConfig = {}): PictwoFakerImage {
  const { width: defWidth, height: defHeight, ...pictwoConfig } = config
  const pictwo = createPictwo(pictwoConfig)
  const host = hostFrom(config)

  const dims = (options: ImageOptions = {}, w = defWidth ?? DEFAULT_WIDTH, h = defHeight ?? DEFAULT_HEIGHT): ImageOptions => ({
    width: w,
    height: h,
    ...options,
  })

  const methods: Record<string, (options?: never) => string> = {
    url: (options: FakerUrlOptions = {}) => pictwo.image.url(dims(withPicsumFilters(options))),
    avatar: (options: ImageOptions = {}) =>
      pictwo.image.avatar(dims(options, DEFAULT_AVATAR, DEFAULT_AVATAR)),
    fashion: (options: ImageOptions = {}) => pictwo.image.fashion(dims(options)),
    fabric: (options: ImageOptions = {}) => pictwo.image.fabric(dims(options)),
    product: (options: ImageOptions = {}) => pictwo.image.product(dims(options)),
    design: (options: ImageOptions = {}) => pictwo.image.design(dims(options)),
    urlPicsumPhotos: (options: FakerUrlOptions = {}) =>
      pictwo.image.url(dims(withPicsumFilters(options))),
    urlLoremFlickr: (options: FakerFlickrOptions = {}) => {
      const { category = 'nature', width, height } = options
      const w = width ?? defWidth ?? DEFAULT_WIDTH
      const h = height ?? defHeight ?? DEFAULT_HEIGHT

      return `${host.replace(/\/$/, '')}/images/${category}?w=${w}&h=${h}`
    },
  } as Record<string, (options?: never) => string>

  // Throw a clear error for any Faker image method we don't implement.
  return new Proxy(methods, {
    get (target, prop) {
      if (typeof prop !== 'string') return Reflect.get(target, prop)
      if (prop in target) return target[prop]

      return () => {
        throw new Error(`[pictwo-faker] Not implemented: image.${prop}() is not supported by the Pictwo provider.`)
      }
    },
  }) as PictwoFakerImage
}

/** Alias matching the documented `pictwoImage()` entry point. */
export const pictwoImage = createFakerImage
