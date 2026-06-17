/**
 * Remove generated variant folders (matching /^\d+x\d+$/) to reclaim space on
 * storage-limited servers. Originals and manifest.json are always preserved.
 *
 * Usage:
 *   pnpm pictwo:images:clean
 *   pnpm pictwo:images:clean -- --dry-run
 *   pnpm pictwo:images:clean -- --base-dir packages/pictwo-images/images
 *   pnpm pictwo:images:clean -- --base-dir storage/app/public/images
 */
import { readdir, rm } from 'node:fs/promises'

import { IMAGES_DIR, VARIANT_FOLDER, parseArgs } from './lib'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export interface RemoveOptions {
  baseDir?: string
  dryRun?: boolean
  onRemove?: (rel: string) => void
}

/** Remove variant folders under `baseDir`. Returns the relative folder paths handled. */
export async function removeScaledImages (options: RemoveOptions = {}): Promise<string[]> {
  const baseDir = options.baseDir ?? IMAGES_DIR
  const { dryRun = false } = options

  if (!existsSync(baseDir)) {
    throw new Error(`[pictwo] base directory not found: ${baseDir}`)
  }

  const categories = (await readdir(baseDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

  const removed: string[] = []

  for (const category of categories) {
    const categoryPath = path.join(baseDir, category)
    const subDirs = (await readdir(categoryPath, { withFileTypes: true }))
      .filter((e) => e.isDirectory() && VARIANT_FOLDER.test(e.name))
      .map((e) => e.name)
      .sort()

    for (const folder of subDirs) {
      const rel = `${category}/${folder}`
      options.onRemove?.(rel)
      if (!dryRun) await rm(path.join(categoryPath, folder), { recursive: true, force: true })
      removed.push(rel)
    }
  }

  return removed
}

async function main () {
  const args = parseArgs(process.argv.slice(2))
  const dryRun = Boolean(args['dry-run'])
  const baseDir = typeof args['base-dir'] === 'string'
    ? path.resolve(process.cwd(), args['base-dir'])
    : IMAGES_DIR

  const removed = await removeScaledImages({
    baseDir,
    dryRun,
    onRemove: (rel) => console.log(`  ${dryRun ? '[dry-run] would remove' : '- removed'} ${rel}`),
  })

  console.log(
    `\n${dryRun ? 'Would remove' : 'Removed'} ${removed.length} variant folder(s) ` +
    `under ${path.relative(process.cwd(), baseDir) || baseDir}.`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
