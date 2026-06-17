/**
 * Generate scaled image variants from each category's `original/` folder using
 * Sharp.
 *
 *   packages/pictwo-images/images/{category}/original/{file}
 *     -> packages/pictwo-images/images/{category}/{width}x{height}/{base}.{format}
 *
 * Usage:
 *   pnpm pictwo:images:generate
 *   pnpm pictwo:images:generate -- --format webp --quality 82
 *   pnpm pictwo:images:generate -- --sizes avatar,card,cover
 *   pnpm pictwo:images:generate -- --only fashion,fabric
 *   pnpm pictwo:images:generate -- --force
 */
import { existsSync } from 'node:fs'
import { mkdir, readdir } from 'node:fs/promises'

import { DEFAULT_SIZE_PRESETS } from '../../packages/pictwo-core/src/presets'
import { IMAGES_DIR, assertImagesDir, isImage, listArg, parseArgs, stripExt } from './lib'
import path from 'node:path'
import sharp from 'sharp'

type SizeName = keyof typeof DEFAULT_SIZE_PRESETS

async function main () {
  assertImagesDir()

  const args = parseArgs(process.argv.slice(2))
  const format = (typeof args.format === 'string' ? args.format : 'webp') as keyof sharp.FormatEnum
  const quality = typeof args.quality === 'string' ? Number(args.quality) : 82
  const force = Boolean(args.force)

  const sizeNames = (listArg(args.sizes) ?? Object.keys(DEFAULT_SIZE_PRESETS)) as SizeName[]
  const onlyCategories = listArg(args.only)

  const sizes = sizeNames.map((name) => {
    const preset = DEFAULT_SIZE_PRESETS[name]
    if (!preset) throw new Error(`[pictwo] Unknown size preset "${name}".`)

    return { name, ...preset }
  })

  const categories = (await readdir(IMAGES_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((c) => !onlyCategories || onlyCategories.includes(c))
    .sort()

  let generated = 0
  let skipped = 0

  for (const category of categories) {
    const originalDir = path.join(IMAGES_DIR, category, 'original')
    if (!existsSync(originalDir)) continue

    const files = (await readdir(originalDir)).filter(isImage).sort()

    for (const file of files) {
      const base = stripExt(file)
      const src = path.join(originalDir, file)

      for (const size of sizes) {
        const folder = `${size.width}x${size.height}`
        const outDir = path.join(IMAGES_DIR, category, folder)
        const outFile = path.join(outDir, `${base}.${format}`)

        if (!force && existsSync(outFile)) {
          skipped++
          continue
        }

        await mkdir(outDir, { recursive: true })
        await sharp(src)
          .resize({ width: size.width, height: size.height, fit: 'cover' })
          .toFormat(format, { quality })
          .toFile(outFile)

        generated++
        console.log(`  + ${category}/${folder}/${base}.${format}`)
      }
    }
  }

  console.log(
    `\nGenerated ${generated} variant(s)` +
    (skipped ? `, skipped ${skipped} existing (use --force to overwrite)` : '') +
    ` across ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}.`,
  )
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
