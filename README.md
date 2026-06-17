# pictwo

[![@pictwo/core](https://img.shields.io/npm/dt/@pictwo/core.svg?label=@pictwo/core)](https://www.npmjs.com/package/@pictwo/core)
[![@pictwo/faker](https://img.shields.io/npm/dt/@pictwo/faker.svg?label=@pictwo/faker)](https://www.npmjs.com/package/@pictwo/faker)
[![@pictwo/images](https://img.shields.io/npm/dt/@pictwo/images.svg?label=@pictwo/images)](https://www.npmjs.com/package/@pictwo/images)
[![Release](https://github.com/arkstack-hq/pictwo/actions/workflows/release.yml/badge.svg)](https://github.com/arkstack-hq/pictwo/actions/workflows/release.yml)
[![Run Tests](https://github.com/arkstack-hq/pictwo/actions/workflows/tests.yml/badge.svg)](https://github.com/arkstack-hq/pictwo/actions/workflows/tests.yml)

A self-hosted image placeholder service with two compatible URL styles, category browsing, deterministic seeding, and real-time image processing via [sharp](https://sharp.pixelplumbing.com).

Drop-in replacement for [Lorem Picsum](https://picsum.photos) with additional [Lorem Toneflix](https://lorem.toneflix.com.ng) API compatibility.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Image Library](#image-library)
- [URL Reference](#url-reference)
  - [Picsum-style routes](#picsum-style-routes)
  - [Lorem Toneflix-compatible routes](#lorem-toneflix-compatible-routes)
  - [Shared query parameters](#shared-query-parameters)
- [API Routes](#api-routes)
  - [List images](#list-images)
  - [Image info](#image-info)
- [Filters](#filters)
- [Seeding](#seeding)
- [Architecture](#architecture)
- [Pictwo Packages](#pictwo-packages)
- [Nginx](#nginx)
- [Contributing](#contributing)
  - [Getting started](#getting-started)
  - [Adding images](#adding-images)
  - [Adding a new category](#adding-a-new-category)
  - [Code changes](#code-changes)
- [License](#license)

## Requirements

- Node.js 20+
- A configured filesystem disk (`filesystem.disks.public.root`) pointing to your public directory

## Installation

```bash
git clone https://github.com/arkstack/pictwo.git
cd pictwo
npm install
cp .env.example .env   # set APP_URL, APP_PORT, etc.
npm run build
npm start
```

For production with auto-restart:

```bash
npm i -g pm2
pm2 start dist/server.js --name pictwo
pm2 save && pm2 startup
```

## Image Library

Images are served from `{public_root}/images/`. The directory structure determines the available categories — every subdirectory becomes a category automatically. Files placed directly in `images/` are uncategorised and excluded from category routes.

```
storage/
└── app/
    └── public/
        └── images/
            ├── african-fashion/
            ├── album/
            ├── avatar/
            ├── event/
            ├── fashion/
            ├── nature/
            ├── people/
            ├── poster/
            └── technology/
```

Supported input formats: `.jpg` `.jpeg` `.png` `.webp` `.avif` `.gif` `.tiff` `.bmp` `.heic` `.heif`

The service scans the directory once at startup and holds the catalogue in memory. Restart the process after adding or removing images.

## URL Reference

### Picsum-style routes

These follow the same conventions as [Lorem Picsum](https://picsum.photos).

| Route                                       | Description                                                    |
| ------------------------------------------- | -------------------------------------------------------------- |
| `GET /{width}`                              | Random image, square crop                                      |
| `GET /{width}/{height}`                     | Random image at exact dimensions                               |
| `GET /{width}/{height}.webp`                | Same, in a specific format (also `.avif`, `.png`, `.jpg`)      |
| `GET /id/{id}/{width}/{height}`             | Specific image by file ID (filename without extension)         |
| `GET /seed/{seed}/{width}/{height}`         | Deterministic random — same seed always returns the same image |
| `GET /category/{category}/{width}/{height}` | Random image from a specific category                          |

**Examples**

```
# 800×600 random image
https://pictwo.toneflix.net/800/600

# Specific image as WebP
https://pictwo.toneflix.net/id/20001/400/300.webp

# Always the same image for this seed
https://pictwo.toneflix.net/seed/my-project/600/400

# Random nature photo
https://pictwo.toneflix.net/category/nature/800/600
```

### Lorem Toneflix-compatible routes

These mirror the [Lorem Toneflix](https://lorem.toneflix.com.ng) API so existing integrations work without changes.

| Route                    | Description                  |
| ------------------------ | ---------------------------- |
| `GET /images`            | Random image                 |
| `GET /images/{category}` | Random image from a category |
| `GET /images/image/{id}` | Specific image by file ID    |

Dimensions are controlled via query params (`?w=` and `?h=`) rather than path segments.

**Examples**

```
# Random 800×600
https://pictwo.toneflix.net/images?w=800&h=600

# Random avatar, square crop
https://pictwo.toneflix.net/images/avatar?w=200&h=200

# Greyscale nature photo
https://pictwo.toneflix.net/images/nature?w=600&h=400&filters=greyscale

# Specific image with text overlay
https://pictwo.toneflix.net/images/image/20001?w=400&h=300&text=true
```

### Shared query parameters

These work on every route regardless of style.

| Parameter          | Description                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| `?w=N` `?h=N`      | Output width / height. Aliases for path-based dimensions on Toneflix routes. |
| `?filters=f1,f2:v` | Comma-separated filter list. See [Filters](#filters).                        |
| `?grayscale`       | Greyscale shorthand (Picsum convention). Equivalent to `?filters=greyscale`. |
| `?blur=1-10`       | Blur shorthand (Picsum convention). Equivalent to `?filters=blur:N`.         |
| `?text=true`       | Overlay the image's file ID as a centred label.                              |
| `?text=Hello`      | Overlay a custom string.                                                     |
| `?seed=anything`   | Any unrecognised query param acts as a seed. See [Seeding](#seeding).        |
| `?random=N`        | Cache-busting no-op (ignored by the server).                                 |
| `?format=webp`     | Output format override. Also accepts `jpeg`, `png`, `avif`.                  |

## API Routes

The `/api/v1` prefix exposes a JSON API for listing and inspecting images in the catalogue. This is useful for building tooling on top of the service, populating a UI with real image metadata, or discovering valid IDs to use with the image routes.

All responses are JSON. No authentication is required.

### List images

Returns a paginated list of all images across all categories.

```
GET /api/v1/list
GET /api/v1/list?page=2&limit=100
```

**Query parameters**

| Parameter | Default | Description           |
| --------- | ------- | --------------------- |
| `page`    | `1`     | Page number (1-based) |
| `limit`   | `30`    | Items per page        |

**Response** — array of image objects:

```json
{
  "data": [
    {
      "id": "60059",
      "url": "https://pictwo.toneflix.net/id/60059/info",
      "width": 800,
      "height": 600,
      "category": "technology",
      "download_url": "https://pictwo.toneflix.net/id/60059/800/600"
    }
  ],
  "links": {
    "prev": "https://pictwo.toneflix.net/api/v1/list?page=1&limit=30",
    "next": "https://pictwo.toneflix.net/api/v1/list?page=3&limit=30"
  }
}
```

`links.prev` and `links.next` are omitted when there is no previous or next page respectively.

**Response fields**

| Field          | Type   | Description                                                     |
| -------------- | ------ | --------------------------------------------------------------- |
| `id`           | string | File ID — filename without extension. Use this in image routes. |
| `url`          | string | Permalink to the image's info endpoint.                         |
| `width`        | number | Native width of the source file in pixels.                      |
| `height`       | number | Native height of the source file in pixels.                     |
| `category`     | string | Category name derived from the parent directory.                |
| `download_url` | string | Ready-to-use image URL at 800×600. Swap dimensions as needed.   |

### Image info

Returns metadata for a single image by ID or by seed. Useful for resolving what image a seed maps to before embedding it.

```
GET /api/v1/id/:id/info
GET /api/v1/seed/:seed/info
```

**Response** — single image object (same shape as the list items above):

```json
{
  "id": "60001",
  "url": "https://pictwo.toneflix.net/id/60001/info",
  "width": 800,
  "height": 600,
  "category": "technology",
  "download_url": "https://pictwo.toneflix.net/id/60001/800/600"
}
```

The seed endpoint resolves the seed to its corresponding image and returns that image's metadata. The resolved ID is stable — the same seed will always resolve to the same object as long as the image library does not change.

## Filters

Filters are passed as a comma-separated string via `?filters=`. Each filter token optionally accepts a value using the `filter:value` syntax.

| Filter      | Value                       | Description                                                       |
| ----------- | --------------------------- | ----------------------------------------------------------------- |
| `blur`      | `:sigma` (1–100, default 2) | Gaussian blur                                                     |
| `greyscale` | —                           | Convert to greyscale. Also accepts `grayscale`.                   |
| `invert`    | —                           | Invert all colours                                                |
| `sharpen`   | —                           | Unsharp mask sharpening                                           |
| `normalize` | —                           | Stretch contrast to full dynamic range. Also accepts `normalise`. |
| `flip`      | —                           | Mirror vertically                                                 |
| `flop`      | —                           | Mirror horizontally                                               |

Filters are applied in the order they appear in the string. You can stack as many as needed.

```
# Single filter
?filters=greyscale

# Blur with a specific sigma
?filters=blur:10

# Stacked filters
?filters=greyscale,blur:5,sharpen

# Toneflix route with multiple filters
/images/nature?w=800&h=600&filters=flip,normalize
```

## Seeding

Seeding makes the selection deterministic — the same seed always picks the same image from the pool, which is useful for consistent UI mockups and tests.

**Path seed (Picsum style)**

```
/seed/{seed}/{width}/{height}
```

**Query param seed (any route)**

Any query parameter that is not a reserved keyword is treated as a seed. Reserved keywords are: `w`, `h`, `width`, `height`, `filters`, `text`, `grayscale`, `greyscale`, `blur`, `random`, `format`.

```
# These all produce the same image every time
/images/avatar?user=42
/800/600?page=home&slot=hero
/category/nature/600/400?component=card
```

Seeds are hashed using a fast integer hash (FNV-inspired `Math.imul`) and mapped to an index within the available pool, so the result is stable across restarts as long as the image library doesn't change.

## Architecture

The service is split into three layers with a clear separation of concerns.

```
src/
├── Utils/
│   └── Image.ts                 # Single-image processing (sharp pipeline)
├── app/services/
│   ├── ImageService.ts          # Directory scanning, catalogue, filter/seed parsing
│   └── ImageServiceProvider.ts  # Singleton façade, ID helpers
└── app/controllers/
    ├── ImageController.ts        # Picsum-style routes
    ├── ImageInfoController.ts    # Image metadata routes.
    ├── ImageListController.ts    # Paginated image listing routes
    └── TonelixController.ts      # Lorem Toneflix-compatible routes
```

**`Image`** wraps a single image file. It owns the sharp pipeline — resize, filters, format conversion, quality — and exposes `make()`, `save()`, `toResponse()`, and the static `withText()` overlay helper. It has no knowledge of HTTP or routing.

**`ImageService`** scans the filesystem at startup and builds an in-memory category map. It also owns the three request-parsing helpers (`resolveFormat`, `resolveFilters`, `extractSeed`) that convert raw query strings into typed `MakeOptions` values. These live in the service layer because they are pure domain transformations with no HTTP framework dependency.

**`ImageServiceProvider`** is a static singleton façade. It initialises and caches the `ImageService` instance and provides stateless utility methods (`fileId`, `findById`, `seedIndex`, `toListItem`) used by both controllers.

**Controllers** are thin. They parse the request (path params, query string), call the service and `Image` class, set response headers, and flush the buffer. No image processing logic lives in a controller.

## Pictwo Packages

This repository is a [PNPM workspace](https://pnpm.io/workspaces). The hosted API lives at
the repo root; reusable Pictwo packages live under [`packages/`](packages/):

| Package                                    | Description                                                         |
| ------------------------------------------ | ------------------------------------------------------------------- |
| [`@pictwo/core`](packages/pictwo-core)     | Typed URL generation for the hosted, jsDelivr, and local providers. |
| [`@pictwo/faker`](packages/pictwo-faker)   | A Faker.js `image` module backed by Pictwo.                         |
| [`@pictwo/images`](packages/pictwo-images) | Portable image asset package (originals, variants, manifest).       |

```ts
import { pictwo } from '@pictwo/core';

pictwo.image.fashion({ width: 800, height: 600, seed: 'home-card' });
// https://pictwo.toneflix.net/category/fashion/800/600?seed=home-card
```

Workspace scripts (run from the repo root):

```bash
pnpm pictwo:build          # build @pictwo/core + @pictwo/faker
pnpm pictwo:test           # test the core + faker packages
pnpm pictwo:typecheck      # typecheck the core + faker packages

pnpm pictwo:images:generate   # generate scaled variants (Sharp)
pnpm pictwo:images:manifest   # rebuild packages/pictwo-images/manifest.json
pnpm pictwo:images:build      # generate + manifest
pnpm pictwo:images:sync       # copy package originals → storage/app/public/images
pnpm pictwo:images:clean      # remove generated variant folders
```

The core package only generates URLs and consumes manifests — the hosted API keeps doing
runtime Sharp processing from `storage/app/public/images`. See each package README for details.

## Nginx

If your server is managed by a control panel that only allows configuration via an include file, place a `.nginx` file in the document root:

```nginx
# /var/www/pictwo.toneflix.net/.nginx

location / {
    proxy_pass         http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

Change `3000` to match your `APP_PORT`. Add `app.set('trust proxy', 1)` in your Express bootstrap so `req.ip` and `req.protocol` reflect the real client values through the proxy.

## Contributing

Contributions are welcome — whether that's adding images to an existing category, creating a new one, fixing a bug, or improving the documentation. Please read the relevant section below before opening a pull request.

### Getting started

1. Fork the repository and clone your fork.
2. Create a branch from `main`: `git checkout -b your-branch-name`
3. Make your changes, then open a pull request against `main` with a clear description of what you changed and why.
   > For non-trivial code changes, open an issue first so the approach can be discussed before you invest time building it.

### Adding images

All images contributed to pictwo must meet the following requirements. Pull requests that include non-compliant images will not be merged.

#### Licence

Every image must be licensed under one of:

- [Creative Commons Zero (CC0)](https://creativecommons.org/publicdomain/zero/1.0/) — no attribution required
- [Creative Commons Attribution (CC BY)](https://creativecommons.org/licenses/by/4.0/) — attribution required in the PR description
- [Unsplash Licence](https://unsplash.com/license) — sourced directly from [unsplash.com](https://unsplash.com)
  Stock photos, AI-generated images, screenshots, and images with unclear provenance are not accepted. If you are unsure about a licence, do not include the image.

#### File size

Each file must be **125 KB or smaller**. Compress images before submitting — [Squoosh](https://squoosh.app) or `sharp` itself work well for this. Files exceeding the limit will be rejected regardless of content.

#### Format and naming

- Accepted formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`
- Filenames are **numeric only**, matching the assigned range for the category the image belongs to (see table below). Do not use descriptive names, hyphens, or any non-numeric characters in the filename: `10042.jpg`, `30017.webp`.
- Use the next available number in the range — do not skip numbers or reuse existing IDs.

#### Category ID ranges

| Category          | Range         |
| ----------------- | ------------- |
| `album`           | 00001 – 09999 |
| `avatar`          | 10001 – 19999 |
| `event`           | 20001 – 29999 |
| `nature`          | 30001 – 39999 |
| `poster`          | 40001 – 49999 |
| `technology`      | 50001 – 59999 |
| `african-fashion` | 60001 – 69999 |
| `fashion`         | 70001 – 79999 |
| `profile`         | 80001 – 80999 |
| `people`          | 90001 – 99999 |

Check existing files in the category directory to find the next available number before adding yours.

#### Where to place files

Drop images into the appropriate subdirectory under `storage/app/public/images/`:

```
storage/app/public/images/nature/30051.jpg
storage/app/public/images/avatar/10063.webp
```

If your image does not fit any existing category, see [Adding a new category](#adding-a-new-category).

### Adding a new category

New categories are welcome, but they must be substantial enough to be useful. The requirements are:

- **Minimum 50 images** must be included in the same pull request as the new category directory. PRs that create a category with fewer images will not be merged.
- All images must comply with the licence and file size rules above.
- The category name must be a single lowercase word or hyphenated phrase that describes the content clearly: `street-food`, `architecture`, `sports`. Avoid vague names like `misc` or `other`.

**Example**

```
storage/app/public/images/architecture/ ← new directory
    100001.jpg
    100002.webp
    ...                                 ← at least 50 files total
```

### Code changes

- The project is written in TypeScript. All new code must be typed — avoid `any`.
- Controllers must stay thin. Image processing logic belongs in `Image`, catalogue and parsing logic belongs in `ImageService`. See [Architecture](#architecture) for the full breakdown.
- Run `pnpm build` before submitting to confirm there are no type errors.
- If you add a new route or change an existing one, update the README and the landing page (`index.html`) to reflect it in the same PR.

## License

MIT © Toneflix
