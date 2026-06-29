import type { ReactNode } from 'react';
import { SdkFooter } from './PageFooter';

export const sdkSectionClass = 'border-t border-black/10 py-8';
export const h2Class =
  'mb-4 font-serif text-2xl leading-tight tracking-[-0.01em] text-[#0e0e0f] sm:text-3xl';
export const h3Class = 'mb-2 mt-6 text-base font-medium text-[#0e0e0f]';
export const pClass =
  'mb-4 max-w-[65ch] text-sm leading-7 text-[#3a3a40] sm:text-base';
export const inlineCodeClass =
  'rounded bg-[#eceae3] px-1.5 py-0.5 font-mono text-[0.85em] text-[#0e0e0f]';

export function SdkTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<ReactNode>>;
}) {
  return (
    <div className="my-4 max-w-full overflow-x-auto">
      <table className="w-full min-w-130 border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="border-b border-black/10 px-3 py-2 text-left font-mono text-xs font-medium uppercase tracking-[0.06em] text-[#7a7a85]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border-b border-black/10 px-3 py-2 align-top text-sm text-[#3a3a40]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="mr-2 inline-block rounded-full bg-[#e1dfd7] px-2 py-0.5 font-mono text-xs text-[#3a3a40]">
      {children}
    </span>
  );
}

export function SdkLayout({
  appName,
  baseUrl,
  children,
}: {
  appName: string;
  baseUrl: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:px-12 lg:py-12">
        <SdkToc />

        <main className="min-w-0">{children}</main>
      </div>

      <SdkFooter appName={appName} baseUrl={baseUrl} />
    </>
  );
}

export function SdkToc() {
  const items = [
    ['Installation', '#install'],
    ['@pictwo/core', '#core'],
    ['Image options', '#options'],
    ['Providers', '#providers'],
    ['Nearest sizing', '#nearest'],
    ['@pictwo/faker', '#faker'],
    ['@pictwo/images', '#images'],
    ['CDN delivery (?cdn)', '#cd'],
  ];

  return (
    <aside className="lg:sticky lg:top-21 lg:self-start">
      <div className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#7a7a85]">
        SDK Reference
      </div>

      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map(([label, href]) => (
          <li key={href} className="shrink-0">
            <a
              href={href}
              className="block rounded-full bg-[#eceae3] px-3 py-1.5 text-sm text-[#3a3a40] transition hover:bg-[#e1dfd7] hover:text-[#e85d26] lg:bg-transparent lg:px-0 lg:py-0"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
