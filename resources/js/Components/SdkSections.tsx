import {
  Pill,
  SdkTable,
  h2Class,
  h3Class,
  inlineCodeClass,
  pClass,
  sdkSectionClass,
} from './SdkDocs';

import { SdkCode } from './Code';

export function SdkIntro({ appName }: { appName: string }) {
  return (
    <>
      <h1 className="mb-3 font-serif text-4xl leading-tight tracking-[-0.02em] text-[#0e0e0f] sm:text-5xl">
        Pictwo SDK
      </h1>

      <p className="mb-10 max-w-[60ch] text-base leading-8 text-[#3a3a40] sm:text-lg">
        Typed helpers for generating {appName} image URLs — from the live hosted
        API, the jsDelivr CDN, or your own static files. One small API, three
        providers.
      </p>
    </>
  );
}

export function InstallationSection() {
  return (
    <section id="install" className={sdkSectionClass}>
      <h2 className={h2Class}>Installation</h2>

      <p className={pClass}>
        The SDK ships as three packages. Most apps only need{' '}
        <code className={inlineCodeClass}>@pictwo/core</code>.
      </p>

      <SdkCode
        code={[
          'pnpm add @pictwo/core',
          '# optional helpers',
          'pnpm add @pictwo/faker @faker-js/faker',
          'pnpm add @pictwo/images          # portable image assets + manifest',
        ]}
      />
    </section>
  );
}

export function CoreSection({ baseUrl }: { baseUrl: string }) {
  return (
    <section id="core" className={sdkSectionClass}>
      <h2 className={h2Class}>@pictwo/core</h2>

      <p className={pClass}>
        <code className={inlineCodeClass}>pictwo</code> is a ready-made instance
        bound to the live hosted API. Use{' '}
        <code className={inlineCodeClass}>createPictwo(config)</code> for a
        custom host or a different provider.
      </p>

      <SdkCode
        code={[
          "import { pictwo } from '@pictwo/core'",
          '',
          'pictwo.image.url({ width: 800, height: 600 })',
          `// ${baseUrl}/800/600`,
          '',
          'pictwo.image.avatar({ width: 200, height: 200 })',
          `// ${baseUrl}/category/avatar/200/200`,
          '',
          "pictwo.image.fashion({ width: 800, height: 600, seed: 'home-card' })",
          `// ${baseUrl}/category/fashion/800/600?seed=home-card`,
          '',
          "pictwo.image.byId('20001', { width: 400, height: 300 })",
          `// ${baseUrl}/id/20001/400/300`,
          '',
          "pictwo.image.seed('hero', { width: 1200, height: 600 })",
          `// ${baseUrl}/seed/hero/1200/600`,
        ]}
      />

      <h3 className={h3Class}>Image API</h3>

      <SdkCode
        code={[
          'pictwo.image.url(options?)',
          'pictwo.image.byCategory(category, options?)',
          'pictwo.image.byId(id, options?)',
          'pictwo.image.seed(seed, options?)',
          '// one shortcut per shipped category:',
          'pictwo.image.avatar / fashion / fabric / product / design / nature / …',
        ]}
      />
    </section>
  );
}

export function ImageOptionsSection() {
  return (
    <section id="options" className={sdkSectionClass}>
      <h2 className={h2Class}>Image options</h2>

      <SdkCode
        code={[
          'interface ImageOptions {',
          '  seed?: string | number',
          '  id?: string',
          '  width?: number',
          '  height?: number',
          "  size?: 'avatar' | 'thumb' | 'card' | 'portrait' | 'cover' | 'og' | string",
          "  format?: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'",
          "  filters?: string[]               // e.g. ['greyscale', 'blur:4']",
          "  fallback?: 'original' | 'nearest' | 'throw'",
          '}',
        ]}
      />

      <h3 className={h3Class}>Size presets</h3>

      <SdkTable
        headers={['Preset', 'Dimensions']}
        rows={[
          [<code className={inlineCodeClass}>avatar</code>, '128×128'],
          [<code className={inlineCodeClass}>thumb</code>, '256×256'],
          [<code className={inlineCodeClass}>card</code>, '400×400'],
          [<code className={inlineCodeClass}>portrait</code>, '600×800'],
          [<code className={inlineCodeClass}>cover</code>, '1200×600'],
          [<code className={inlineCodeClass}>og</code>, '1200×630'],
        ]}
      />

      <SdkCode
        code={[
          "pictwo.image.url({ size: 'og' })                       // → /1200/630",
          "pictwo.image.url({ width: 800, height: 600, format: 'webp' })  // → /800/600.webp",
          "pictwo.image.url({ width: 800, height: 600, filters: ['greyscale', 'blur:4'] })",
          '// → /800/600?filters=greyscale,blur:4',
        ]}
      />
    </section>
  );
}

export function ProvidersSection({ baseUrl }: { baseUrl: string }) {
  return (
    <section id="providers" className={sdkSectionClass}>
      <h2 className={h2Class}>Providers</h2>

      <p className={pClass}>
        <Pill>hosted</Pill>
        The live API with runtime Sharp processing default.
      </p>

      <SdkCode
        code={`createPictwo({ source: { driver: 'hosted', baseUrl: '${baseUrl}' } })`}
      />

      <p className={pClass}>
        <Pill>jsdelivr</Pill>
        Static assets from the published{' '}
        <code className={inlineCodeClass}>@pictwo/images</code> package.
        Requires a manifest.
      </p>

      <SdkCode
        code={[
          "import manifest from '@pictwo/images/manifest.json'",
          '',
          'const pictwo = createPictwo({',
          "  source: { driver: 'jsdelivr', packageName: '@pictwo/images', version: '1.0.0' },",
          '  manifest,',
          '})',
          '',
          "pictwo.image.fashion({ seed: 'home-card' })",
          '// https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/img/fashion/original/model-001.jpg',
          '',
          "pictwo.image.fashion({ seed: 'home-card', size: 'card' })",
          '// https://cdn.jsdelivr.net/npm/@pictwo/images@1.0.0/img/fashion/400x400/model-001.webp',
        ]}
      />

      <p className={pClass}>
        <Pill>local</Pill>
        Static paths served from your own app.
      </p>

      <SdkCode
        code={[
          "createPictwo({ source: { driver: 'local', baseUrl: '/pictwo/images' }, manifest })",
          '// /pictwo/images/fashion/original/model-001.jpg',
        ]}
      />
    </section>
  );
}

export function NearestSizingSection() {
  return (
    <section id="nearest" className={sdkSectionClass}>
      <h2 className={h2Class}>Nearest sizing</h2>

      <p className={pClass}>
        Static providers only serve pre-generated variants. The{' '}
        <code className={inlineCodeClass}>jsdelivr</code> provider snaps any
        requested width/height to the <strong>nearest available variant</strong>{' '}
        by default, so you always get a real file.
      </p>

      <SdkCode
        code={[
          'jsdelivr.image.fashion({ width: 300, height: 300 })',
          '// → .../fashion/400x400/model-001.webp   (nearest variant)',
          '',
          '// opt local into the same behaviour:',
          "local.image.fashion({ width: 300, height: 300, fallback: 'nearest' })",
        ]}
      />

      <SdkTable
        headers={['fallback', 'Behaviour when the exact variant is missing']}
        rows={[
          [
            <code className={inlineCodeClass}>nearest</code>,
            'snap to the closest available variant (jsdelivr default)',
          ],
          [
            <code className={inlineCodeClass}>original</code>,
            'serve the full-size original (local default)',
          ],
          [
            <code className={inlineCodeClass}>throw</code>,
            'raise a clear error',
          ],
        ]}
      />
    </section>
  );
}

export function FakerSection({ baseUrl }: { baseUrl: string }) {
  return (
    <section id="faker" className={sdkSectionClass}>
      <h2 className={h2Class}>@pictwo/faker</h2>

      <p className={pClass}>
        A Faker.js <code className={inlineCodeClass}>image</code> module backed
        by Pictwo. Drop it onto <code className={inlineCodeClass}>faker</code>:
      </p>

      <SdkCode
        code={[
          "import { faker } from '@faker-js/faker'",
          "import { pictwoImage } from '@pictwo/faker'",
          '',
          'export const fake = { ...faker, image: pictwoImage() }',
          '',
          `fake.image.url()             // ${baseUrl}/640/480`,
          `fake.image.avatar()          // ${baseUrl}/category/avatar/128/128`,
          `fake.image.africanFashion()  // ${baseUrl}/category/african-fashion/640/480`,
          "fake.image.urlLoremFlickr({ category: 'fashion', width: 320, height: 240 })",
          `// ${baseUrl}/images/fashion?w=320&h=240`,
        ]}
      />

      <p className={pClass}>
        There is one method per shipped category. Hyphenated slugs become
        camelCase, e.g. <code className={inlineCodeClass}>african-fashion</code>{' '}
        → <code className={inlineCodeClass}>africanFashion</code>.{' '}
        <code className={inlineCodeClass}>urlPicsumPhotos()</code> also maps
        Faker&apos;s grayscale/blur options onto filters. Unsupported Faker
        methods throw a clear{' '}
        <code className={inlineCodeClass}>Not implemented</code> error.
      </p>
    </section>
  );
}

export function ImagesSection() {
  return (
    <section id="images" className={sdkSectionClass}>
      <h2 className={h2Class}>@pictwo/images</h2>

      <p className={pClass}>
        The portable asset package: category originals, generated variants, and
        a deterministic <code className={inlineCodeClass}>manifest.json</code>.
        Manage it from the repo root:
      </p>

      <SdkCode
        code={[
          'pnpm pictwo:images:generate    # generate scaled variants (Sharp)',
          'pnpm pictwo:images:manifest    # rebuild manifest.json',
          'pnpm pictwo:images:build       # generate + manifest',
          'pnpm pictwo:images:sync        # copy originals → storage/app/public/images',
          'pnpm pictwo:images:clean       # remove generated variant folders',
        ]}
      />
    </section>
  );
}

export function CdnDeliverySection({ baseUrl }: { baseUrl: string }) {
  return (
    <section id="cd" className={sdkSectionClass}>
      <h2 className={h2Class}>
        CDN delivery — <code className={inlineCodeClass}>?cdn</code>
      </h2>

      <p className={pClass}>
        Add <code className={inlineCodeClass}>?cdn</code> to any image route on
        the hosted API to skip runtime processing. The API resolves the matching
        jsDelivr URL and <strong>302-redirects</strong> straight to it, so it
        works as a drop-in <code className={inlineCodeClass}>{'<img>'}</code>{' '}
        source.
      </p>

      <SdkCode
        code={[
          `GET ${baseUrl}/category/fashion/400/400?cdn`,
          '→ 302 Location: https://cdn.jsdelivr.net/npm/@pictwo/images@x/img/fashion/400x400/…webp',
          '',
          `GET ${baseUrl}/id/20001/800/600?cdn`,
          `GET ${baseUrl}/seed/hero/1200/600?cdn`,
          '',
          `<img src="${baseUrl}/category/fashion/400/400?cdn" />`,
        ]}
      />

      <p className={pClass}>
        The same route shapes as the REST API are supported:{' '}
        <code className={inlineCodeClass}>
          /{'{w}'}/{'{h}'}
        </code>
        , <code className={inlineCodeClass}>/id/…</code>,{' '}
        <code className={inlineCodeClass}>/seed/…</code>, and{' '}
        <code className={inlineCodeClass}>/category/…</code>. CDN variants are
        served as <code className={inlineCodeClass}>webp</code> by default.
      </p>
    </section>
  );
}
