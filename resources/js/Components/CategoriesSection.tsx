import { cn, pageSection } from '../utils';

import { CategoriesProps } from '../types';
import { SectionHeading } from './Compile';

export function CategoriesSection({
  baseUrl,
  categories,
  loadedCategories,
  hiddenCategories,
  setLoadedCategories,
  setHiddenCategories,
  prefillCategory,
}: CategoriesProps) {
  return (
    <section
      id="categories"
      className={cn(pageSection, 'border-b border-black/10 bg-[#eceae3]')}
    >
      <SectionHeading
        tag="Browse"
        title="Available Categories"
        subtitle="Every category maps directly to a URL segment. Use it with either route style."
      />

      <div className="grid grid-cols-2 overflow-hidden rounded-md border border-black/10 bg-black/10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((category) => (
          <a
            key={category}
            className="group relative aspect-4/3 overflow-hidden bg-[#e1dfd7]"
            href="#playground"
            onClick={(event) => {
              event.preventDefault();
              prefillCategory(category);
            }}
          >
            {!hiddenCategories[category] && (
              <img
                src={`${baseUrl}/images/${encodeURIComponent(category)}?w=480&h=360&seed=cover`}
                alt={category}
                className={cn(
                  'block size-full object-cover opacity-0 transition duration-300 group-hover:scale-105',
                  loadedCategories[category] && 'opacity-100',
                )}
                onLoad={() =>
                  setLoadedCategories((current) => ({
                    ...current,
                    [category]: true,
                  }))
                }
                onError={() =>
                  setHiddenCategories((current) => ({
                    ...current,
                    [category]: true,
                  }))
                }
              />
            )}

            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition group-hover:from-black/90" />

            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="mb-1 font-serif text-lg capitalize leading-tight text-white">
                {category}
              </div>
              <div className="font-mono text-[0.62rem] tracking-[0.04em] text-white/60 transition group-hover:text-[#f28c5e]">
                /images/{category}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
