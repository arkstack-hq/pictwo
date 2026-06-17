/**
 * Build the CDN distribution: optimize the full-resolution `images/` source into
 * a smaller `img/` directory (webp), then rebuild the manifest from `img/`.
 *
 *   packages/pictwo-images/images/{category}/{folder}/{file}
 *     -> packages/pictwo-images/img/{category}/{folder}/{base}.webp
 *
 * `img/` is gitignored but is the directory published to npm (and therefore
 * served by jsDelivr), which caps the package well under jsDelivr's ~140MB
 * limit. `original/` images are downscaled to `--max`; variant folders are
 * re-encoded as-is.
 *
 * Usage:
 *   pnpm pictwo:images:cdn
 *   pnpm pictwo:images:cdn -- --quality 72 --max 1600
 *   pnpm pictwo:images:cdn -- --sizes avatar,card,cover   # limit variant folders
 *   pnpm pictwo:images:cdn -- --only fashion,fabric
 *   pnpm pictwo:images:cdn -- --no-originals              # variants only
 *   pnpm pictwo:images:cdn -- --force
 */
import { mkdir, readdir, rm, stat } from 'node:fs/promises'

import { DEFAULT_SIZE_PRESETS } from '../../packages/pictwo-core/src/presets'
import { IMAGES_DIR, IMG_DIR, MANIFEST_PATH, VARIANT_FOLDER, assertImagesDir, isImage, listArg, parseArgs, stripExt } from './lib'
import { buildManifest } from './build-image-manifest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const JSDELIVR_LIMIT_MB = 140

function presetFolders (names: string[]): Set<string> {
  return new Set(names.map((name) => {
    const preset = DEFAULT_SIZE_PRESETS[name as keyof typeof DEFAULT_SIZE_PRESETS]
    if (preset) return `${preset.width}x${preset.height}`
    if (VARIANT_FOLDER.test(name)) return name

    throw new Error(`[pictwo] Unknown size "${name}" (expected a preset name or WxH).`)
  }))
}

async function dirSize (dir: string): Promise<number> {
  let total = 0
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) total += await dirSize(full)
    else total += (await stat(full)).size
  }

  return total
}

async function main () {
  assertImagesDir()

  const args = parseArgs(process.argv.slice(2))
  const quality = typeof args.quality === 'string' ? Number(args.quality) : 75
  const maxDim = typeof args.max === 'string' ? Number(args.max) : 1600
  const force = Boolean(args.force)
  const includeOriginals = !args['no-originals']
  const onlyCategories = listArg(args.only)
  const sizeFilter = listArg(args.sizes) ? presetFolders(listArg(args.sizes)!) : null

  if (force && existsSync(IMG_DIR)) await rm(IMG_DIR, { recursive: true, force: true })

  const categories = (await readdir(IMAGES_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((c) => !onlyCategories || onlyCategories.includes(c))
    .sort()

  let written = 0
  let skipped = 0

  for (const category of categories) {
    const categoryDir = path.join(IMAGES_DIR, category)
    const folders = (await readdir(categoryDir, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .filter((folder) => {
        if (folder === 'original') return includeOriginals
        if (!VARIANT_FOLDER.test(folder)) return false

        return !sizeFilter || sizeFilter.has(folder)
      })
      .sort()

    for (const folder of folders) {
      const srcDir = path.join(categoryDir, folder)
      const outDir = path.join(IMG_DIR, category, folder)
      const files = (await readdir(srcDir)).filter(isImage).sort()

      for (const file of files) {
        const outFile = path.join(outDir, `${stripExt(file)}.webp`)
        if (!force && existsSync(outFile)) {
          skipped++
          continue
        }

        await mkdir(outDir, { recursive: true })
        const pipeline = sharp(path.join(srcDir, file))
        // Only the originals need downscaling; variants are already sized.
        if (folder === 'original') {
          pipeline.resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
        }
        await pipeline.webp({ quality }).toFile(outFile)
        written++
      }
    }
  }

  // The published manifest must describe what ships (img/), not the source.
  const manifest = await buildManifest(IMG_DIR, MANIFEST_PATH)

  const bytes = existsSync(IMG_DIR) ? await dirSize(IMG_DIR) : 0
  const mb = bytes / (1024 * 1024)
  const categoryCount = Object.keys(manifest.categories).length

  console.log(
    `\nCDN build: ${written} written, ${skipped} skipped, ${categoryCount} categor` +
    `${categoryCount === 1 ? 'y' : 'ies'} → img/ (${mb.toFixed(1)} MB).`,
  )
  console.log(`Manifest: ${path.relative(process.cwd(), MANIFEST_PATH)}`)

  if (mb > JSDELIVR_LIMIT_MB) {
    console.warn(
      `\n⚠️  img/ is ${mb.toFixed(1)} MB, over jsDelivr's ~${JSDELIVR_LIMIT_MB} MB limit. ` +
      'Lower --quality/--max, trim --sizes, or pass --no-originals.',
    )
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
