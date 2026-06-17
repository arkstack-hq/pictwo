import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

/**
 * Repo root, derived from this file's location (scripts/pictwo/lib.ts) so the
 * scripts work regardless of the current working directory — including when run
 * from a package's `prepack` during `pnpm publish`.
 */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const IMAGES_PACKAGE_DIR = path.resolve(ROOT, 'packages/pictwo-images')
export const IMAGES_DIR = path.join(IMAGES_PACKAGE_DIR, 'images')
/** Optimized, CDN-sized distribution shipped to npm (gitignored, generated). */
export const IMG_DIR = path.join(IMAGES_PACKAGE_DIR, 'img')
export const MANIFEST_PATH = path.join(IMAGES_PACKAGE_DIR, 'manifest.json')
export const STORAGE_IMAGES_DIR = path.resolve(ROOT, 'storage/app/public/images')

/** Extensions treated as source images. */
export const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif', '.gif',
])

/** A variant folder is exactly `<width>x<height>`. */
export const VARIANT_FOLDER = /^\d+x\d+$/

export function isImage (file: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase())
}

export function stripExt (file: string): string {
  const ext = path.extname(file)

  return ext ? file.slice(0, -ext.length) : file
}

/** Minimal `--flag value` / `--flag` parser over argv. */
export function parseArgs (argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {}
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      out[key] = next
      i++
    } else {
      out[key] = true
    }
  }

  return out
}

/** Split a comma list flag into a trimmed string array (or null when absent). */
export function listArg (value: string | boolean | undefined): string[] | null {
  if (typeof value !== 'string') return null

  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

export function assertImagesDir (): void {
  if (!existsSync(IMAGES_DIR)) {
    throw new Error(`[pictwo] images directory not found: ${IMAGES_DIR}`)
  }
}
