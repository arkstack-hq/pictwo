import { cn, pageSection } from '../utils';

import { SamplesProps } from '../types';
import { SectionHeading } from './Compile';

export function SamplesSection({
  baseUrl,
  mosaicTiles,
  reloadNonce,
  spinning,
  reloadSamples,
  buildTileUrl,
  loadedMosaic,
  hiddenMosaic,
  setLoadedMosaic,
  setHiddenMosaic,
}: SamplesProps) {
  return (
    <div id="samples" className={cn(pageSection, 'border-b border-black/10')}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading tag="Live samples" title="See it in action" />

        <button
          type="button"
          className="flex w-fit items-center gap-2 rounded-md border border-[#e1dfd7] px-4 py-2 font-mono text-xs font-medium text-[#3a3a40] transition hover:border-[#3a3a40] hover:text-[#0e0e0f]"
          onClick={reloadSamples}
        >
          <svg
            className={cn(
              'size-3 transition-transform duration-500',
              spinning && 'animate-spin',
            )}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M13.5 2.5A6.5 6.5 0 1 1 2.5 8" />
            <polyline points="0,4 2.5,8 5,4" />
          </svg>
          New set
        </button>
      </div>

      <div className="grid auto-rows-[180px] grid-cols-2 gap-2 md:grid-cols-4">
        {mosaicTiles.map((tile, index) => (
          <div
            key={`${tile.route}-${tile.caption}`}
            className={cn(
              'group relative overflow-hidden rounded-md bg-[#eceae3]',
              tile.className,
            )}
          >
            {!hiddenMosaic[index] && (
              <img
                src={buildTileUrl(baseUrl, tile, reloadNonce)}
                alt={tile.alt}
                className={cn(
                  'block size-full object-cover opacity-0 transition duration-300 group-hover:scale-105',
                  loadedMosaic[index] && 'opacity-100',
                )}
                onLoad={() =>
                  setLoadedMosaic((current) => ({
                    ...current,
                    [index]: true,
                  }))
                }
                onError={() =>
                  setHiddenMosaic((current) => ({
                    ...current,
                    [index]: true,
                  }))
                }
              />
            )}

            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-3 py-2 font-mono text-[0.65rem] uppercase tracking-wider text-white/80 opacity-0 transition group-hover:opacity-100">
              {tile.caption}
            </div>

            <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.06em] text-white/85 backdrop-blur">
              {tile.pill}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
