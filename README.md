# pictwo

A self-hosted image placeholder service with two compatible URL styles, category browsing, deterministic seeding, and real-time image processing via [sharp](https://sharp.pixelplumbing.com).

Drop-in replacement for [Lorem Picsum](https://picsum.photos) with additional [Lorem Toneflix](https://lorem.toneflix.com.ng) API compatibility.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Image Library](#image-library)
- [URL Reference](#url-reference)
  - [Picsum-style routes](#picsum-style-routes)
  - [Lorem Toneflix-compatible routes](#lorem-toneflix-compatible-routes)
  - [Shared query parameters](#shared-query-parameters)
- [Filters](#filters)
- [Seeding](#seeding)
- [Architecture](#architecture)
- [Nginx](#nginx)
- [License](#license)

---

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

---

## Image Library

Images are served from `{public_root}/images/`. The directory structure determines the available categories — every subdirectory becomes a category automatically. Files placed directly in `images/` are uncategorised and excluded from category routes.

```
public/
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

---

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

---

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

---

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

---

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

---

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

---

## Architecture

The service is split into three layers with a clear separation of concerns.

```
src/
├── Utils/
│   └── Image.ts              # Single-image processing (sharp pipeline)
├── app/services/
│   ├── ImageService.ts       # Directory scanning, catalogue, filter/seed parsing
│   └── ImageServiceProvider.ts  # Singleton façade, ID helpers
└── app/controllers/
    ├── ImageController.ts    # Picsum-style routes
    └── TonelixController.ts  # Lorem Toneflix-compatible routes
```

**`Image`** wraps a single image file. It owns the sharp pipeline — resize, filters, format conversion, quality — and exposes `make()`, `save()`, `toResponse()`, and the static `withText()` overlay helper. It has no knowledge of HTTP or routing.

**`ImageService`** scans the filesystem at startup and builds an in-memory category map. It also owns the three request-parsing helpers (`resolveFormat`, `resolveFilters`, `extractSeed`) that convert raw query strings into typed `MakeOptions` values. These live in the service layer because they are pure domain transformations with no HTTP framework dependency.

**`ImageServiceProvider`** is a static singleton façade. It initialises and caches the `ImageService` instance and provides stateless utility methods (`fileId`, `findById`, `seedIndex`, `toListItem`) used by both controllers.

**Controllers** are thin. They parse the request (path params, query string), call the service and `Image` class, set response headers, and flush the buffer. No image processing logic lives in a controller.

---

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

---

## License

MIT © Toneflix
