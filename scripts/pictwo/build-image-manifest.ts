/**
 * Scan an images directory and write a deterministic manifest.json.
 *
 *   - detects categories (top-level folders)
 *   - detects originals (category/original/*)
 *   - detects variant folders matching /^\d+x\d+$/
 *   - excludes .gitkeep and non-images
 *   - sorts everything for stable output
 *
 * Usage: pnpm pictwo:images:manifest
 */
import { readdir, writeFile } from 'node:fs/promises'

import { IMAGES_DIR, MANIFEST_PATH, VARIANT_FOLDER, isImage } from './lib'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export interface ManifestCategory {
  original: string[]
  variants?: Record<string, string[]>
}

export interface ImageManifest {
  version: number
  categories: Record<string, ManifestCategory>
}

async function imagesIn (dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })

  return entries
    .filter((e) => e.isFile() && isImage(e.name))
    .map((e) => e.name)
    .sort()
}

/** Build (and optionally write) a manifest for `imagesDir`. */
export async function buildManifest (
  imagesDir: string = IMAGES_DIR,
  manifestPath?: string,
): Promise<ImageManifest> {
  if (!existsSync(imagesDir)) {
    throw new Error(`[pictwo] images directory not found: ${imagesDir}`)
  }

  const categories: Record<string, ManifestCategory> = {}

  const categoryDirs = (await readdir(imagesDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

  for (const category of categoryDirs) {
    const categoryPath = path.join(imagesDir, category)
    const subDirs = (await readdir(categoryPath, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()

    const original = subDirs.includes('original')
      ? await imagesIn(path.join(categoryPath, 'original'))
      : []

    const variants: Record<string, string[]> = {}
    for (const folder of subDirs) {
      if (!VARIANT_FOLDER.test(folder)) continue
      const files = await imagesIn(path.join(categoryPath, folder))
      if (files.length) variants[folder] = files
    }

    if (!original.length && !Object.keys(variants).length) continue

    const entry: ManifestCategory = { original }
    if (Object.keys(variants).length) entry.variants = variants
    categories[category] = entry
  }

  const manifest: ImageManifest = { version: 1, categories }

  if (manifestPath) {
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8')
  }

  return manifest
}

async function main () {
  const manifest = await buildManifest(IMAGES_DIR, MANIFEST_PATH)
  const categories = Object.keys(manifest.categories)
  const originals = categories.reduce((n, c) => n + manifest.categories[c].original.length, 0)
  const variants = categories.reduce(
    (n, c) => n + Object.values(manifest.categories[c].variants ?? {}).reduce((m, f) => m + f.length, 0),
    0,
  )

  console.log(
    `Wrote ${path.relative(process.cwd(), MANIFEST_PATH)}: ` +
    `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}, ` +
    `${originals} original(s), ${variants} variant(s).`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
