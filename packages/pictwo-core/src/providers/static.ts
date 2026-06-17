import type { Provider, ProviderContext } from './types'
import { explicitDimensions, seedIndex, stripExt } from '../internal'

import type { ImageManifest } from '../types'
import type { ImageRequest } from '../internal'

interface Selected {
  category: string
  /** Original file name (with extension), e.g. `model-001.jpg`. */
  file: string
}

/**
 * Shared logic for providers backed by static, pre-generated assets
 * (jsdelivr/local). Selection is driven by the manifest; the concrete provider
 * only decides how to compose the final asset URL.
 */
export abstract class StaticProvider implements Provider {
  abstract readonly driver: string

  /** Fallback used when an exact variant is missing and none is requested. */
  protected readonly defaultFallback: 'original' | 'nearest' | 'throw' = 'original'

  /** Compose a URL for `images/{category}/{folder}/{file}`. */
  protected abstract assetUrl (category: string, folder: string, file: string): string

  url (req: ImageRequest, ctx: ProviderContext): string {
    const manifest = ctx.manifest
    if (!manifest) {
      throw new Error(
        `[pictwo] The "${this.driver}" provider requires a manifest. ` +
        'Pass `manifest` to createPictwo() (see @pictwo/images/manifest.json).',
      )
    }

    const selected = selectImage(manifest, req)
    const base = stripExt(selected.file)
    const dims = explicitDimensions(req, ctx.presets)

    if (dims) {
      const format = req.format ?? 'webp'
      const variantFile = `${base}.${format}`
      const variants = manifest.categories[selected.category]?.variants ?? {}
      const exactFolder = `${dims.width}x${dims.height}`

      // 1. Exact variant match.
      if (variants[exactFolder]?.includes(variantFile)) {
        return this.assetUrl(selected.category, exactFolder, variantFile)
      }

      const mode = req.fallback ?? this.defaultFallback

      // 2. Nearest available variant that contains this file.
      if (mode === 'nearest') {
        const near = nearestVariant(variants, dims.width, dims.height, variantFile)
        if (near) return this.assetUrl(selected.category, near, variantFile)
        // no usable variant — fall back to the original
      } else if (mode === 'throw') {
        throw new Error(
          `[pictwo] No "${exactFolder}" variant "${variantFile}" for category ` +
          `"${selected.category}". Generate it with \`pnpm pictwo:images:generate\`, ` +
          'or use fallback: "nearest" | "original".',
        )
      }
      // mode === 'original' (or nothing nearby) — fall through to the original asset
    }

    return this.assetUrl(selected.category, 'original', selected.file)
  }
}

/**
 * Find the variant folder closest to the requested dimensions that actually
 * contains `file`. Distance is the Manhattan distance between dimension pairs;
 * ties break on the smaller folder name for determinism. Returns `null` when no
 * variant folder holds the file.
 */
export function nearestVariant (
  variants: Record<string, string[]>,
  width: number,
  height: number,
  file: string,
): string | null {
  let best: { folder: string; distance: number } | null = null

  for (const folder of Object.keys(variants).sort()) {
    const match = /^(\d+)x(\d+)$/.exec(folder)
    if (!match) continue
    if (!variants[folder].includes(file)) continue

    const distance = Math.abs(Number(match[1]) - width) + Math.abs(Number(match[2]) - height)
    if (!best || distance < best.distance) best = { folder, distance }
  }

  return best?.folder ?? null
}

/**
 * Pick an original asset from the manifest. Category keys are sorted so that
 * seeded selection across the whole library is stable across runs.
 */
export function selectImage (manifest: ImageManifest, req: ImageRequest): Selected {
  const pool: Selected[] = []

  if (req.category) {
    const entry = manifest.categories[req.category]
    if (!entry) {
      throw new Error(`[pictwo] Unknown category "${req.category}" in manifest.`)
    }
    for (const file of entry.original) pool.push({ category: req.category, file })
  } else {
    for (const category of Object.keys(manifest.categories).sort()) {
      for (const file of manifest.categories[category].original) {
        pool.push({ category, file })
      }
    }
  }

  if (!pool.length) {
    throw new Error(
      `[pictwo] No images available${req.category ? ` in category "${req.category}"` : ''}. ` +
      'Add originals and rebuild the manifest with `pnpm pictwo:images:manifest`.',
    )
  }

  if (req.id != null) {
    const found = pool.find((p) => stripExt(p.file) === String(req.id))
    if (!found) {
      throw new Error(`[pictwo] No image with id "${req.id}" found in the manifest.`)
    }

    return found
  }

  const index = req.seed != null
    ? seedIndex(req.seed, pool.length)
    : Math.floor(Math.random() * pool.length)

  return pool[index]
}
