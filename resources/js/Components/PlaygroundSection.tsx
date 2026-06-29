import { PlaygroundProps, RouteStyle } from '../types';
import { cn, inputClass, labelClass, pageSection } from '../utils';

import { SectionHeading } from './Compile';

export function PlaygroundSection({
  baseUrl,
  categories,
  filterChips,
  fonts,
  pgBase,
  setPgBase,
  pgStyle,
  setPgStyle,
  pgW,
  setPgW,
  pgH,
  setPgH,
  pgFmt,
  setPgFmt,
  pgCat,
  setPgCat,
  pgId,
  setPgId,
  pgSeed,
  setPgSeed,
  pgText,
  setPgText,
  pgFont,
  setPgFont,
  activeFilters,
  toggleFilter,
  previewUrl,
  previewFailed,
  setPreviewFailed,
  copyLabel,
  copyPreviewUrl,
}: PlaygroundProps) {
  return (
    <section
      id="playground"
      className={cn(pageSection, 'border-t border-black/10')}
    >
      <SectionHeading
        tag="Interactive"
        title="Playground"
        subtitle="Build a URL and preview the result — no setup needed."
      />

      <div className="grid max-w-7xl grid-cols-1 mx-auto items-start gap-8 lg:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-4">
          <label className={labelClass}>
            Base URL
            <input
              className={inputClass}
              type="text"
              value={pgBase}
              placeholder={baseUrl}
              onChange={(event) => setPgBase(event.target.value)}
            />
          </label>

          <label className={labelClass}>
            Route style
            <select
              className={inputClass}
              value={pgStyle}
              onChange={(event) => setPgStyle(event.target.value as RouteStyle)}
            >
              <option value="picsum">
                Picsum — /{'{width}'}/{'{height}'}
              </option>
              <option value="toneflix">
                Lorem Toneflix — /images/{'{category}'}
              </option>
              <option value="id">
                By ID — /id/{'{id}'}/{'{width}'}/{'{height}'}
              </option>
              <option value="category">
                By category — /category/{'{cat}'}/{'{w}'}/{'{h}'}
              </option>
              <option value="seed">
                Seeded — /seed/{'{seed}'}/{'{width}'}/{'{height}'}
              </option>
            </select>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Width
              <input
                className={inputClass}
                type="number"
                value={pgW}
                min="1"
                max="4000"
                onChange={(event) => setPgW(event.target.value)}
              />
            </label>

            <label className={labelClass}>
              Height
              <input
                className={inputClass}
                type="number"
                value={pgH}
                min="1"
                max="4000"
                onChange={(event) => setPgH(event.target.value)}
              />
            </label>
          </div>

          {(pgStyle === 'toneflix' || pgStyle === 'category') && (
            <label className={labelClass}>
              Category
              <select
                className={inputClass}
                value={pgCat}
                onChange={(event) => setPgCat(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          )}

          {pgStyle === 'id' && (
            <label className={labelClass}>
              Image ID
              <input
                className={inputClass}
                type="text"
                value={pgId}
                placeholder="file name without extension"
                onChange={(event) => setPgId(event.target.value)}
              />
            </label>
          )}

          {pgStyle === 'seed' && (
            <label className={labelClass}>
              Seed
              <input
                className={inputClass}
                type="text"
                value={pgSeed}
                placeholder="any string"
                onChange={(event) => setPgSeed(event.target.value)}
              />
            </label>
          )}

          <label className={labelClass}>
            Format
            <select
              className={inputClass}
              value={pgFmt}
              onChange={(event) => setPgFmt(event.target.value)}
            >
              <option value="">jpeg (default)</option>
              <option value=".webp">webp</option>
              <option value=".avif">avif</option>
              <option value=".png">png</option>
            </select>
          </label>

          <div className={labelClass}>
            Filters
            <div className="flex flex-wrap gap-2">
              {filterChips.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={cn(
                    'rounded-full border px-3 py-1.5 font-mono text-xs font-medium transition cursor-pointer',
                    activeFilters.includes(filter)
                      ? 'border-[#0e0e0f] bg-[#0e0e0f] text-white'
                      : 'border-[#e84f1f] bg-[#f5f4f0] text-[#e84f1f] hover:border-[#a82e08]',
                  )}
                  onClick={() => toggleFilter(filter)}
                >
                  {filter === 'blur:5' ? 'blur' : filter}
                </button>
              ))}
            </div>
          </div>

          {pgStyle === 'toneflix' && (
            <div
              className={cn(
                'grid gap-3',
                pgText ? 'sm:grid-cols-[2fr_1fr]' : 'grid-cols-1',
              )}
            >
              <label className={labelClass}>
                Text overlay (optional)
                <input
                  className={inputClass}
                  type="text"
                  value={pgText}
                  placeholder="Leave blank for none, or type text"
                  onChange={(event) => setPgText(event.target.value)}
                />
              </label>

              {pgText ? (
                <label className={labelClass}>
                  Font
                  <select
                    className={inputClass}
                    value={pgFont}
                    onChange={(event) => setPgFont(event.target.value)}
                  >
                    <option value="">Times (default)</option>
                    {Object.entries(fonts).map(([value, name]) => (
                      <option value={value} key={value}>
                        {name
                          .split(',')
                          .at(0)
                          ?.replaceAll('"', '')
                          .replaceAll(';', '')}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
          )}
        </div>

        <div className="min-w-0 h-full">
          <div className="flex min-h-70 w-full max-w-full flex-col overflow-hidden rounded-md border border-[#e1dfd7] bg-[#eceae3] sm:min-h-85 lg:min-h-full">
            <div className="relative flex min-h-60 flex-1 items-center justify-center overflow-hidden bg-[#eceae3] p-3 sm:min-h-75 lg:min-h-90">
              {previewFailed ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center font-mono text-sm text-[#7a7a85]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    aria-hidden="true"
                    className="size-10 opacity-30"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  Preview failed
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="Generated placeholder"
                  className="max-h-60 w-auto max-w-full rounded object-contain sm:max-h-75 lg:max-h-90"
                  onError={() => setPreviewFailed(true)}
                />
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-3 bg-[#0e0e0f] px-4 py-3 font-mono text-xs leading-6 text-white/70 sm:flex-row sm:items-start sm:justify-between">
              <span className="min-w-0 flex-1 break-all">{previewUrl}</span>

              <button
                type="button"
                className="w-fit shrink-0 rounded border border-[#f28c5e]/40 px-3 py-1 text-[0.68rem] font-medium text-[#f28c5e] transition hover:bg-[#f28c5e]/10"
                onClick={copyPreviewUrl}
              >
                {copyLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
