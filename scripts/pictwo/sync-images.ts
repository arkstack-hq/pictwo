/**
 * Sync the portable image package into the hosted API's storage directory.
 *
 *   packages/pictwo-images/images/{category}/original/{file}
 *     -> storage/app/public/images/{category}/{file}
 *
 * Originals are flattened into each category folder so the hosted app's image
 * discovery (which treats every sub-folder of `images/` as a category) keeps
 * working unchanged. Generated variant folders are intentionally NOT synced —
 * the hosted API resizes at runtime.
 *
 * Usage:
 *   pnpm pictwo:images:sync
 *   pnpm pictwo:images:sync -- --dry-run
 *   pnpm pictwo:images:sync -- --only fashion,fabric
 *   pnpm pictwo:images:sync -- --force        # overwrite existing files
 */
import { copyFile, mkdir, readdir } from 'node:fs/promises'

import { IMAGES_DIR, STORAGE_IMAGES_DIR, assertImagesDir, isImage, listArg, parseArgs } from './lib'
import { existsSync } from 'node:fs'
import path from 'node:path'

async function main () {
  assertImagesDir()

  const args = parseArgs(process.argv.slice(2))
  const dryRun = Boolean(args['dry-run'])
  const force = Boolean(args.force)
  const only = listArg(args.only)

  const categories = (await readdir(IMAGES_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((c) => !only || only.includes(c))
    .sort()

  let copied = 0
  let skipped = 0

  for (const category of categories) {
    const originalDir = path.join(IMAGES_DIR, category, 'original')
    if (!existsSync(originalDir)) continue

    const files = (await readdir(originalDir)).filter(isImage).sort()
    if (!files.length) continue

    const destDir = path.join(STORAGE_IMAGES_DIR, category)
    if (!dryRun) await mkdir(destDir, { recursive: true })

    for (const file of files) {
      const dest = path.join(destDir, file)
      if (!force && existsSync(dest)) {
        skipped++
        continue
      }
      console.log(`  ${dryRun ? '[dry-run] would copy' : '+ copied'} ${category}/${file}`)
      if (!dryRun) await copyFile(path.join(originalDir, file), dest)
      copied++
    }
  }

  console.log(
    `\n${dryRun ? 'Would copy' : 'Copied'} ${copied} image(s)` +
    (skipped ? `, skipped ${skipped} existing (use --force to overwrite)` : '') +
    ` to ${path.relative(process.cwd(), STORAGE_IMAGES_DIR) || STORAGE_IMAGES_DIR}.`,
  )
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
