# @pictwo/core

[![@pictwo/core](https://img.shields.io/npm/dt/@pictwo/core.svg?label=@pictwo/core)](https://www.npmjs.com/package/@pictwo/core)
[![@pictwo/faker](https://img.shields.io/npm/dt/@pictwo/faker.svg?label=@pictwo/faker)](https://www.npmjs.com/package/@pictwo/faker)
[![@pictwo/images](https://img.shields.io/npm/dt/@pictwo/images.svg?label=@pictwo/images)](https://www.npmjs.com/package/@pictwo/images)
[![Release](https://github.com/arkstack-hq/pictwo/actions/workflows/release.yml/badge.svg)](https://github.com/arkstack-hq/pictwo/actions/workflows/release.yml)
[![Run Tests](https://github.com/arkstack-hq/pictwo/actions/workflows/tests.yml/badge.svg)](https://github.com/arkstack-hq/pictwo/actions/workflows/tests.yml)

URL-generation core for **Pictwo** — The open-source drop-in placeholder images service built on Arkstack with a hosted version currently available from [pictwo.toneflix.net](https://pictwo.toneflix.net). It builds image URLs for three
providers from one small, typed API.

```bash
pnpm add @pictwo/core
```

## Quick start

```ts
import { pictwo } from '@pictwo/core';

pictwo.image.url({ width: 800, height: 600 });
// https://pictwo.toneflix.net/800/600

pictwo.image.avatar({ width: 200, height: 200 });
// https://pictwo.toneflix.net/category/avatar/200/200

pictwo.image.fashion({ width: 800, height: 600, seed: 'home-card' });
// https://pictwo.toneflix.net/category/fashion/800/600?seed=home-card

pictwo.image.byId('20001', { width: 400, height: 300 });
// https://pictwo.toneflix.net/id/20001/400/300

pictwo.image.seed('hero', { width: 1200, height: 600 });
// https://pictwo.toneflix.net/seed/hero/1200/600
```

`pictwo` is the default instance bound to the live hosted API. Use `createPictwo(config)`
for a custom host or a different provider.

## Image API

```ts
pictwo.image.url(options?)
pictwo.image.avatar(options?)
pictwo.image.fashion(options?)
pictwo.image.fabric(options?)
pictwo.image.product(options?)
pictwo.image.design(options?)
pictwo.image.byCategory(category, options?)
pictwo.image.byId(id, options?)
pictwo.image.seed(seed, options?)
```

### Options

```ts
interface ImageOptions {
  seed?: string | number;
  id?: string;
  width?: number;
  height?: number;
  size?: 'avatar' | 'thumb' | 'card' | 'portrait' | 'cover' | 'og' | string;
  format?: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif';
  filters?: string[];
  fallback?: 'original' | 'throw';
}
```

### Size presets

```ts
import { DEFAULT_SIZE_PRESETS } from '@pictwo/core';

// avatar 128×128 · thumb 256×256 · card 400×400
// portrait 600×800 · cover 1200×600 · og 1200×630

pictwo.image.url({ size: 'og' }); // → /1200/630
```

Override or extend them via `createPictwo({ sizePresets })`.

### Formats & filters

```ts
pictwo.image.url({ width: 800, height: 600, format: 'webp' });
// https://pictwo.toneflix.net/800/600.webp

pictwo.image.url({ width: 800, height: 600, filters: ['greyscale', 'blur:4'] });
// https://pictwo.toneflix.net/800/600?filters=greyscale,blur:4
```

## Providers

### Hosted (default)

The live ArkStack API with runtime Sharp processing.

```ts
createPictwo({
  source: { driver: 'hosted', baseUrl: 'https://pictwo.toneflix.net' },
});
```

Route shapes generated:

| Call                     | URL                                     |
| ------------------------ | --------------------------------------- |
| `url({ width, height })` | `/{width}/{height}`                     |
| `byId(id, …)`            | `/id/{id}/{width}/{height}`             |
| `seed(seed, …)`          | `/seed/{seed}/{width}/{height}`         |
| `byCategory(cat, …)`     | `/category/{cat}/{width}/{height}`      |
| `fashion({ seed })`      | `/category/fashion/{w}/{h}?seed={seed}` |

### jsDelivr

Static assets from the published [`@pictwo/images`](../pictwo-images) package.
Requires a manifest.

```ts
import manifest from '@pictwo/images/manifest.json';

const pictwo = createPictwo({
  source: {
    driver: 'jsdelivr',
    packageName: '@pictwo/images',
    version: '1.0.0',
  },
  manifest,
});

pictwo.image.fashion({ seed: 'home-card' });
// https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/img/fashion/original/model-001.jpg

pictwo.image.fashion({ seed: 'home-card', width: 400, height: 400 });
// https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/img/fashion/400x400/model-001.webp
```

### Local

Static paths served from your own app.

```ts
const pictwo = createPictwo({
  source: { driver: 'local', baseUrl: '/pictwo/images' },
  manifest,
});

pictwo.image.fashion({ seed: 'home-card' });
// /pictwo/images/fashion/original/model-001.jpg

pictwo.image.fashion({ seed: 'home-card', size: 'card' });
// /pictwo/images/fashion/400x400/model-001.webp
```

## Selection & fallback behaviour

- **Same seed + same category → same image.** Seeding uses the same 32-bit hash as the
  hosted API (`seedIndex`), so static selection matches the live service.
- **No seed → random** selection from the category (or the whole library).
- **Hosted** provider delegates selection and processing to the runtime API.
- **jsDelivr / local** providers select files from the manifest and resolve a
  `{width}x{height}` variant folder when a matching size is requested.
- **Missing variant + `fallback: 'original'`** (default) → original asset URL.
- **Missing variant + `fallback: 'throw'`** → a clear error.

## Exports

```ts
(createPictwo, pictwo);
(DEFAULT_PICTWO_HOST, DEFAULT_SIZE_PRESETS, seedIndex);
// types: PictwoConfig, ImageOptions, ImageProvider, ImageCategory, ImageManifest, …
```
