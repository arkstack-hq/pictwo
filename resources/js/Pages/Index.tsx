'use client';

import { MosaicTile, PageProps } from '../types';
import { useMemo, useState } from 'react';

import { ApiSection } from '../Components/ApiSection';
import { CategoriesSection } from '../Components/CategoriesSection';
import { EndpointsSection } from '../Components/EndpointsSection';
import { FiltersSection } from '../Components/FiltersSection';
import { HeroSection } from '../Components/HeroSection';
import { PageFooter } from '../Components/PageFooter';
import { PageHeader } from '../Components/PageHeader';
import { PlaygroundSection } from '../Components/PlaygroundSection';
import { SamplesSection } from '../Components/SamplesSection';
import { StatsSection } from '../Components/StatsSection';

const mosaicTiles: MosaicTile[] = [
  {
    className: 'row-span-2 md:col-span-2',
    width: 760,
    height: 368,
    route: 'random',
    alt: 'random placeholder',
    caption: 'random · 760×368',
    pill: 'random',
  },
  {
    className: 'row-span-2',
    width: 368,
    height: 368,
    route: 'seed',
    seed: 'sunrise',
    alt: 'seeded placeholder',
    caption: 'seed: sunrise',
    pill: 'seeded',
  },
  {
    className: '',
    width: 368,
    height: 180,
    route: 'filter',
    filter: 'greyscale',
    alt: 'greyscale placeholder',
    caption: 'greyscale',
    pill: 'greyscale',
  },
  {
    className: '',
    width: 368,
    height: 180,
    route: 'filter',
    filter: 'blur:6',
    alt: 'blur placeholder',
    caption: 'blur · sigma 6',
    pill: 'blur',
  },
  {
    className: 'md:col-span-2',
    width: 760,
    height: 180,
    route: 'category',
    category: 'technology',
    alt: 'technology category',
    caption: 'category · technology',
    pill: 'category',
  },
  {
    className: '',
    width: 368,
    height: 180,
    route: 'filter',
    filter: 'sharpen,normalize',
    alt: 'sharpen+normalize placeholder',
    caption: 'sharpen + normalize',
    pill: 'multi-filter',
  },
];

const filterChips = [
  'greyscale',
  'blur:5',
  'sharpen',
  'invert',
  'normalize',
  'flip',
];

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '');
}

function buildTileUrl(baseUrl: string, tile: MosaicTile, reloadNonce: number) {
  const nonce = `_r=${reloadNonce + tile.width}`;

  switch (tile.route) {
    case 'seed':
      return `${baseUrl}/seed/${tile.seed}/${tile.width}/${tile.height}`;

    case 'filter':
      return `${baseUrl}/${tile.width}/${tile.height}?filters=${tile.filter}&${nonce}`;

    case 'category':
      return `${baseUrl}/images/${tile.category}?w=${tile.width}&h=${tile.height}&${nonce}`;

    case 'random':
    default:
      return `${baseUrl}/${tile.width}/${tile.height}?${nonce}`;
  }
}

export default function Index({
  appName,
  config,
  categories,
  fonts,
}: PageProps) {
  const baseUrl = useMemo(
    () => trimTrailingSlash(config.app.url),
    [config.app.url],
  );

  const [reloadNonce, setReloadNonce] = useState(() => Date.now());
  const [spinning, setSpinning] = useState(false);
  const [loadedMosaic, setLoadedMosaic] = useState<Record<number, boolean>>({});
  const [hiddenMosaic, setHiddenMosaic] = useState<Record<number, boolean>>({});
  const [loadedCategories, setLoadedCategories] = useState<
    Record<string, boolean>
  >({});
  const [hiddenCategories, setHiddenCategories] = useState<
    Record<string, boolean>
  >({});

  const [pgBase, setPgBase] = useState(baseUrl);
  const [pgStyle, setPgStyle] = useState<
    'picsum' | 'toneflix' | 'id' | 'category' | 'seed'
  >('picsum');
  const [pgW, setPgW] = useState('800');
  const [pgH, setPgH] = useState('600');
  const [pgFmt, setPgFmt] = useState('');
  const [pgCat, setPgCat] = useState(categories[0] ?? 'nature');
  const [pgId, setPgId] = useState('10001');
  const [pgSeed, setPgSeed] = useState('my-app-123');
  const [pgText, setPgText] = useState('');
  const [pgFont, setPgFont] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [copyLabel, setCopyLabel] = useState('copy');

  const previewUrl = useMemo(() => {
    const base = trimTrailingSlash(pgBase) || baseUrl;
    const width = pgW || '800';
    const height = pgH || '600';
    const category = pgCat.trim() || 'nature';
    const imageId = pgId.trim() || 'image-01';
    const seed = pgSeed.trim() || 'seed-1';
    const text = pgText.trim();
    const font = pgFont.trim();

    let path = '';
    const params = new URLSearchParams();

    switch (pgStyle) {
      case 'toneflix':
        path = `/images/${category}`;
        params.set('w', width);
        params.set('h', height);
        break;

      case 'id':
        path = `/id/${imageId}/${width}/${height}${pgFmt}`;
        break;

      case 'category':
        path = `/category/${category}/${width}/${height}${pgFmt}`;
        break;

      case 'seed':
        path = `/seed/${seed}/${width}/${height}${pgFmt}`;
        break;

      case 'picsum':
      default:
        path = `/${width}/${height}${pgFmt}`;
        break;
    }

    if (activeFilters.length) {
      if (pgStyle === 'toneflix') {
        params.set('filters', activeFilters.join(','));
      } else {
        activeFilters.forEach((filter) => {
          const [name, value] = filter.split(':');

          if (name === 'greyscale') {
            params.set('grayscale', '1');
          } else if (name === 'blur') {
            params.set('blur', value || '5');
          } else {
            params.append('filters', filter);
          }
        });
      }
    }

    if (text) {
      params.set('text', text);
    }

    if (font) {
      params.set('font', font);
    }

    const query = params.toString();

    return base + path + (query ? `?${query}` : '');
  }, [
    pgBase,
    baseUrl,
    pgW,
    pgH,
    pgCat,
    pgId,
    pgSeed,
    pgText,
    pgFont,
    pgStyle,
    pgFmt,
    activeFilters,
  ]);

  function reloadSamples() {
    setReloadNonce(Date.now());
    setLoadedMosaic({});
    setHiddenMosaic({});
    setSpinning(true);

    window.setTimeout(() => setSpinning(false), 500);
  }

  function prefillCategory(category: string) {
    setPgStyle('toneflix');
    setPgCat(category);

    document.getElementById('playground')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function toggleFilter(filter: string) {
    setActiveFilters((current) => {
      if (current.includes(filter)) {
        return current.filter((item) => item !== filter);
      }

      return [...current, filter];
    });
  }

  async function copyPreviewUrl() {
    if (!previewUrl) return;

    await navigator.clipboard.writeText(previewUrl);
    setCopyLabel('✓ copied');
  }

  return (
    <>
      <PageHeader
        baseUrl={baseUrl}
        appName={appName}
        logoUrl={config.app.url + '/logo.png'}
        config={config}
        categories={[]}
        fonts={{}}
      />

      <HeroSection />

      <StatsSection />

      <SamplesSection
        baseUrl={baseUrl}
        mosaicTiles={mosaicTiles}
        reloadNonce={reloadNonce}
        spinning={spinning}
        reloadSamples={reloadSamples}
        buildTileUrl={buildTileUrl}
        loadedMosaic={loadedMosaic}
        hiddenMosaic={hiddenMosaic}
        setLoadedMosaic={setLoadedMosaic}
        setHiddenMosaic={setHiddenMosaic}
      />

      <CategoriesSection
        baseUrl={baseUrl}
        categories={categories}
        loadedCategories={loadedCategories}
        hiddenCategories={hiddenCategories}
        setLoadedCategories={setLoadedCategories}
        setHiddenCategories={setHiddenCategories}
        prefillCategory={prefillCategory}
      />

      <EndpointsSection />

      <ApiSection baseUrl={baseUrl} />

      <FiltersSection />

      <PlaygroundSection
        baseUrl={baseUrl}
        categories={categories}
        filterChips={filterChips}
        fonts={fonts}
        pgBase={pgBase}
        setPgBase={setPgBase}
        pgStyle={pgStyle}
        setPgStyle={setPgStyle}
        pgW={pgW}
        setPgW={setPgW}
        pgH={pgH}
        setPgH={setPgH}
        pgFmt={pgFmt}
        setPgFmt={setPgFmt}
        pgCat={pgCat}
        setPgCat={setPgCat}
        pgId={pgId}
        setPgId={setPgId}
        pgSeed={pgSeed}
        setPgSeed={setPgSeed}
        pgText={pgText}
        setPgText={setPgText}
        pgFont={pgFont}
        setPgFont={setPgFont}
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        previewUrl={previewUrl}
        previewFailed={previewFailed}
        setPreviewFailed={setPreviewFailed}
        copyLabel={copyLabel}
        copyPreviewUrl={copyPreviewUrl}
      />

      <PageFooter appName={appName} />
    </>
  );
}
