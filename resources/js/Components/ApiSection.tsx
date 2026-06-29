import { ApiParamsTable, ApiRoute, SectionHeading } from './Compile';
import { cn, pageSection } from '../utils';

import { ApiResponseCode } from './Code';

export function ApiSection({ baseUrl }: { baseUrl: string }) {
  return (
    <section id="api" className={cn(pageSection, 'border-t border-black/10')}>
      <SectionHeading
        tag="JSON API"
        title="API Routes"
        subtitle="Inspect the image catalogue programmatically. All routes return JSON and require no authentication."
      />

      <div className="grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2 mx-auto">
        <div className="flex flex-col gap-4">
          <ApiRoute>/api/v1/list</ApiRoute>

          <p className="text-sm font-light leading-6 text-[#3a3a40]">
            Returns a paginated list of every image across all categories.
          </p>

          <ApiParamsTable
            rows={[
              ['?page', '1', 'Page number, 1-based'],
              ['?limit', '30', 'Items per page'],
            ]}
          />

          <ApiResponseCode
            title="Response · array"
            code={JSON.stringify(
              {
                data: [
                  {
                    id: '60059',
                    url: 'https://pictwo.toneflix.net/api/v1/id/60059/info',
                    width: 800,
                    height: 600,
                    category: 'technology',
                    download_url:
                      'https://pictwo.toneflix.net/id/60059/800/600',
                  },
                ],
                links: {
                  prev: 'https://pictwo.toneflix.net/api/v1/list?page=1&limit=30',
                  next: 'https://pictwo.toneflix.net/api/v1/list?page=3&limit=30',
                },
              },
              null,
              2,
            )}
          />
        </div>

        <div className="flex flex-col gap-4">
          <ApiRoute>
            /api/v1/id/<span className="text-[#f28c5e]">:id</span>/info
          </ApiRoute>

          <ApiRoute>
            /api/v1/seed/<span className="text-[#f28c5e]">:seed</span>/info
          </ApiRoute>

          <p className="text-sm font-light leading-6 text-[#3a3a40]">
            Returns metadata for a single image by file ID or seed. The seed
            endpoint resolves which image the seed maps to and returns that
            image&apos;s details — useful for confirming what a seed will
            produce before embedding it.
          </p>

          <ApiResponseCode
            title="Response · object"
            code={JSON.stringify(
              {
                id: '60001',
                url: `${baseUrl}/api/v1/id/60001/info`,
                width: 800,
                height: 600,
                category: 'technology',
                download_url: `${baseUrl}/id/60001/800/600`,
              },
              null,
              2,
            )}
          />

          <p className="text-xs leading-5 text-[#3a3a40]">
            <code className="font-mono text-[#e85d26]">links.prev</code> and{' '}
            <code className="font-mono text-[#e85d26]">links.next</code> are
            omitted when there is no previous or next page.
          </p>

          <ApiParamsTable
            header={<span className="col-span-3">Response fields</span>}
            rows={[
              [
                'id',
                'string',
                'Filename without extension — use in image routes',
              ],
              [
                'width / height',
                'number',
                'Native dimensions of the source file',
              ],
              ['category', 'string', 'Parent directory name'],
              ['download_url', 'string', 'Ready-to-use image URL at 800×600'],
            ]}
          />
        </div>
      </div>
    </section>
  );
}
