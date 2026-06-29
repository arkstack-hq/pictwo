import { MethodBadge } from './Compile';

export function HeroSection() {
  const endpoints = [
    '/800/600',
    '/id/10001/400/300.webp',
    '/category/nature/600/400',
    '/images/avatar?w=200&h=200&filters=greyscale',
  ];

  return (
    <div className="grid min-h-[calc(100vh-60px)] grid-cols-1 items-center md:grid-cols-2">
      <div className="border-b border-black/10 px-6 py-12 md:border-b-0 md:border-r md:px-12 md:py-20">
        <div className="mb-6 inline-block rounded-full bg-[#e85d26]/10 px-3 py-1 font-mono text-[0.72rem] font-medium uppercase tracking-widest text-[#e85d26]">
          Open-source · MIT licence
        </div>

        <h1 className="mb-6 font-serif text-5xl leading-[1.05] tracking-[-0.03em] text-[#0e0e0f] sm:text-6xl lg:text-7xl">
          Beautiful
          <br />
          <em className="text-[#e85d26]">placeholder</em>
          <br />
          images, fast.
        </h1>

        <p className="mb-10 max-w-md text-base font-light leading-7 text-[#3a3a40] sm:text-lg">
          Drop-in placeholder images for every project. Random, seeded,
          categorised, or specific - Built with{' '}
          <a
            className="text-[#e85d26] hover:text-[#f28c5e]"
            target="_blank"
            rel="noreferrer"
            href="https://arkstack.toneflix.net"
          >
            Arkstack
          </a>
          .
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <a
            className="rounded-md bg-[#0e0e0f] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-px hover:bg-[#e85d26]"
            href="#playground"
          >
            Explore the API
          </a>

          <a
            className="flex items-center gap-2 font-mono text-xs text-[#3a3a40] transition hover:text-[#e85d26]"
            href="https://github.com/arkstack-hq/pictwo"
            target="_blank"
            rel="noreferrer"
          >
            <svg
              className="size-4"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>

      <div className="flex h-full flex-col justify-center gap-5 bg-[#eceae3] px-6 py-10 md:px-12 md:py-12">
        {endpoints.map((endpoint) => (
          <div
            key={endpoint}
            className="flex items-center gap-3 rounded-md bg-[#0e0e0f] px-5 py-4"
          >
            <MethodBadge>GET</MethodBadge>
            <code className="break-all font-mono text-[0.82rem] text-white/85">
              {endpoint}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
