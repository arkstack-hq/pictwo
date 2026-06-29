import { PageProps } from '../types';

export function PageHeader({ appName, baseUrl, logoUrl }: PageProps) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f4f0]/95 backdrop-blur">
        <nav className="mx-auto flex h-15 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
          <a
            className="inline-flex items-center leading-none"
            href="#"
            aria-label={`${appName} home`}
          >
            <img
              className="block h-9.5 w-auto max-w-47.5 object-contain"
              src={logoUrl}
              alt={`${appName} logo`}
            />
          </a>

          <ul className="hidden items-center gap-8 lg:flex">
            {[
              ['Examples', '#samples'],
              ['Categories', '#categories'],
              ['Endpoints', '#endpoints'],
              ['API', '#api'],
              ['Filters', '#filters'],
              ['Playground', '#playground'],
              ['SDK', `${baseUrl}/docs`],
            ].map(([label, href]) => (
              <li key={label}>
                <a
                  className="text-sm font-normal text-[#3a3a40] transition hover:text-[#e85d26]"
                  href={href}
                >
                  {label}
                </a>
              </li>
            ))}

            <li>
              <a
                className="rounded-md border border-[#e85d26] px-4 py-1.5 font-mono text-xs font-medium text-[#e85d26] transition hover:bg-[#e85d26] hover:text-white"
                href="#playground"
              >
                Try it →
              </a>
            </li>
          </ul>

          <a
            className="rounded-md border border-[#e85d26] px-3 py-1.5 font-mono text-xs font-medium text-[#e85d26] transition hover:bg-[#e85d26] hover:text-white lg:hidden"
            href="#playground"
          >
            Try it →
          </a>
        </nav>
      </header>
    </>
  );
}

export function SdkHeader({
  appName,
  baseUrl,
  logoUrl,
}: Pick<PageProps, 'appName' | 'baseUrl' | 'logoUrl'>) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f4f0]/95 backdrop-blur">
      <nav className="mx-auto flex h-15 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
        <a href={baseUrl} aria-label={`${appName} home`}>
          <img
            src={logoUrl}
            alt={appName}
            className="block h-7 w-auto max-w-45 object-contain"
          />
        </a>

        <ul className="flex items-center gap-4 text-sm sm:gap-6">
          <li className="hidden sm:block">
            <a
              className="text-[#3a3a40] transition hover:text-[#e85d26]"
              href={baseUrl}
            >
              Home
            </a>
          </li>

          <li className="hidden sm:block">
            <a
              className="text-[#3a3a40] transition hover:text-[#e85d26]"
              href={`${baseUrl}#endpoints`}
            >
              REST API
            </a>
          </li>

          <li>
            <a
              className="rounded-md bg-[#0e0e0f] px-4 py-2 font-mono text-xs font-medium text-[#f5f4f0] transition hover:bg-[#e85d26]"
              href="https://www.npmjs.com/package/@pictwo/core"
              target="_blank"
              rel="noreferrer"
            >
              npm →
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
