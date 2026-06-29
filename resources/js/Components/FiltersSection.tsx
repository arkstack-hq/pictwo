import { cn, pageSection } from '../utils';

import { SectionHeading } from './Compile';

export function FiltersSection() {
  const filters = [
    [
      'blur ',
      ':sigma',
      'Gaussian blur. Amount 1–100 (default 2).',
      '?filters=blur:10',
    ],
    [
      'greyscale',
      '',
      'Convert to greyscale. Also accepts grayscale.',
      '?filters=greyscale',
    ],
    [
      'sharpen',
      '',
      'Increase image sharpness using an unsharp mask.',
      '?filters=sharpen',
    ],
    [
      'invert',
      '',
      'Invert all colours in the image (negate).',
      '?filters=invert',
    ],
    [
      'normalize',
      '',
      'Stretch contrast to full dynamic range.',
      '?filters=normalize',
    ],
    [
      'flip / flop',
      '',
      'Mirror vertically (flip) or horizontally (flop).',
      '?filters=flip,flop',
    ],
  ];

  return (
    <section id="filters" className={cn(pageSection, 'bg-[#eceae3]')}>
      <SectionHeading
        tag="Image processing"
        title="Filters"
        subtitle="Stack filters with commas. Filters that accept a value use the filter:value syntax."
      />

      <div className="grid overflow-hidden rounded-md border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
        {filters.map(([name, param, description, example]) => (
          <div key={name} className="bg-[#f5f4f0] p-6">
            <div className="mb-2 flex items-center gap-2 font-mono text-sm font-medium text-[#0e0e0f]">
              {name}
              {param ? (
                <span className="rounded bg-[#e85d26]/10 px-2 py-1 text-xs text-[#f28c5e]">
                  {param}
                </span>
              ) : null}
            </div>

            <div className="mb-3 text-xs leading-5 text-[#7a7a85]">
              {description}
            </div>

            <div className="break-all rounded bg-[#eceae3] px-3 py-2 font-mono text-xs text-[#7a7a85]">
              {example}
            </div>
          </div>
        ))}

        <div className="bg-[#f5f4f0] p-6 sm:col-span-2 lg:col-span-3">
          <div className="mb-2 font-mono text-sm font-medium text-[#0e0e0f]">
            combining filters
          </div>
          <div className="mb-3 text-xs leading-5 text-[#7a7a85]">
            All filters can be combined in a single request by separating them
            with commas.
          </div>
          <div className="break-all rounded bg-[#eceae3] px-3 py-2 font-mono text-xs text-[#7a7a85]">
            ?filters=greyscale,blur:5,sharpen
          </div>
        </div>
      </div>
    </section>
  );
}
