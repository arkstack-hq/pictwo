import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'

import { buildManifest } from '../scripts/pictwo/build-image-manifest'
import { existsSync } from 'node:fs'
import { removeScaledImages } from '../scripts/pictwo/remove-scaled-images'
import { tmpdir } from 'node:os'
import path from 'node:path'

let dir: string

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'pictwo-images-'))

  // fashion: 2 originals + a 400x400 variant folder
  await mkdir(path.join(dir, 'fashion', 'original'), { recursive: true })
  await writeFile(path.join(dir, 'fashion', 'original', 'model-002.jpg'), 'x')
  await writeFile(path.join(dir, 'fashion', 'original', 'model-001.jpg'), 'x')
  await writeFile(path.join(dir, 'fashion', 'original', '.gitkeep'), '')
  await mkdir(path.join(dir, 'fashion', '400x400'), { recursive: true })
  await writeFile(path.join(dir, 'fashion', '400x400', 'model-001.webp'), 'x')

  // fabric: original only, with .gitkeep that must be excluded
  await mkdir(path.join(dir, 'fabric', 'original'), { recursive: true })
  await writeFile(path.join(dir, 'fabric', 'original', '.gitkeep'), '')
})

afterAll(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('manifest builder', () => {
  it('scans categories, originals, and variants deterministically', async () => {
    const manifest = await buildManifest(dir)

    expect(manifest.version).toBe(1)
    // sorted originals, .gitkeep excluded
    expect(manifest.categories.fashion.original).toEqual(['model-001.jpg', 'model-002.jpg'])
    expect(manifest.categories.fashion.variants).toEqual({ '400x400': ['model-001.webp'] })
    // empty category (only .gitkeep) is omitted
    expect(manifest.categories.fabric).toBeUndefined()
  })

  it('writes manifest.json when a path is given', async () => {
    const out = path.join(dir, 'manifest.json')
    await buildManifest(dir, out)
    expect(existsSync(out)).toBe(true)
  })
})

describe('cleanup script', () => {
  it('lists variant folders without removing them on dry-run', async () => {
    const removed = await removeScaledImages({ baseDir: dir, dryRun: true })
    expect(removed).toEqual(['fashion/400x400'])
    expect(existsSync(path.join(dir, 'fashion', '400x400'))).toBe(true)
  })

  it('removes only variant folders, preserving originals', async () => {
    const removed = await removeScaledImages({ baseDir: dir })
    expect(removed).toEqual(['fashion/400x400'])
    expect(existsSync(path.join(dir, 'fashion', '400x400'))).toBe(false)
    expect(existsSync(path.join(dir, 'fashion', 'original', 'model-001.jpg'))).toBe(true)
  })
})
