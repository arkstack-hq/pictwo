# @pictwo/images

[![@pictwo/core](https://img.shields.io/npm/dt/@pictwo/core.svg)](https://www.npmjs.com/package/@pictwo/core)
[![@pictwo/faker](https://img.shields.io/npm/dt/@pictwo/faker.svg)](https://www.npmjs.com/package/@pictwo/faker)
[![@pictwo/images](https://img.shields.io/npm/dt/@pictwo/images.svg)](https://www.npmjs.com/package/@pictwo/images)

The portable **Pictwo** image asset package: category originals, generated variants, and
a deterministic `manifest.json`. Consumed by [`@pictwo/core`](../pictwo-core) via the
`jsdelivr` and `local` providers, and syncable into the hosted API's storage.

```bash
pnpm add @pictwo/images
```

## Layout

```
images/
  avatar/   original/  [400x400/  …]
  fashion/  original/  [400x400/  …]
  fabric/   original/  [400x400/  …]
  product/  original/  [400x400/  …]
  design/   original/  [400x400/  …]
manifest.json
```

- `original/` holds the source images.
- `{width}x{height}/` folders hold generated variants (default `webp`).
- `manifest.json` describes everything and powers static URL generation.

## Manifest shape

```json
{
  "version": 1,
  "categories": {
    "fashion": {
      "original": ["model-001.jpg", "model-002.jpg"],
      "variants": {
        "400x400": ["model-001.webp", "model-002.webp"]
      }
    }
  }
}
```

## Workflows (run from the repo root)

```bash
# 1. Drop originals into packages/pictwo-images/images/{category}/original/

# 2. Generate scaled variants (Sharp)
pnpm pictwo:images:generate
pnpm pictwo:images:generate -- --sizes avatar,card,cover --only fashion,fabric
pnpm pictwo:images:generate -- --format webp --quality 82 --force

# 3. Build the manifest
pnpm pictwo:images:manifest

# generate + manifest in one step
pnpm pictwo:images:build

# 4. Sync originals into the hosted API storage (storage/app/public/images)
pnpm pictwo:images:sync
pnpm pictwo:images:sync -- --only fashion --dry-run

# 5. Reclaim space — remove generated variant folders
pnpm pictwo:images:clean
pnpm pictwo:images:clean -- --dry-run
pnpm pictwo:images:clean -- --base-dir storage/app/public/images
```

### Syncing to the hosted app

`pnpm pictwo:images:sync` flattens each `images/{category}/original/*` into
`storage/app/public/images/{category}/*`. The hosted app treats every sub-folder of
`images/` as a category, so flattening keeps its image discovery working unchanged.
Generated variant folders are **not** synced — the hosted API resizes at runtime.

## Using the assets

```ts
import { createPictwo } from '@pictwo/core';
import manifest from '@pictwo/images/manifest.json';

// jsDelivr CDN
const cdn = createPictwo({
  source: {
    driver: 'jsdelivr',
    packageName: '@pictwo/images',
    version: '1.0.0',
  },
  manifest,
});

// Local static files
const local = createPictwo({
  source: { driver: 'local', baseUrl: '/pictwo/images' },
  manifest,
});
```
