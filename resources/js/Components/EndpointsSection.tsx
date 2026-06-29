import { MethodBadge, SectionHeading } from './Compile';

import { pageSection } from '../utils';

function EpParam({ children }: { children: React.ReactNode }) {
  return <span className="text-[#e85d26]">{children}</span>;
}

function EndpointGroup({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <div className="border-b border-black/10 pb-2 font-mono text-[0.72rem] font-medium uppercase tracking-widest text-[#7a7a85]">
        {title}
      </div>
      {children}
    </div>
  );
}

function EndpointRow({
  method = 'GET',
  variant = 'get',
  path,
  description,
  badge,
}: {
  method?: string;
  variant?: 'get' | 'param';
  path: React.ReactNode;
  description: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[70px_1fr_auto] items-start gap-4 border-b border-black/10 py-4">
      <MethodBadge variant={variant}>{method}</MethodBadge>

      <div>
        <div className="font-mono text-sm text-[#0e0e0f]">{path}</div>
        <div className="mt-1 text-xs leading-5 text-[#7a7a85]">
          {description}
        </div>
      </div>

      <span>{badge}</span>
    </div>
  );
}

export function EndpointsSection() {
  return (
    <section id="endpoints" className={pageSection}>
      <SectionHeading
        tag="Reference"
        title="API Endpoints"
        subtitle="Two compatible URL styles — Picsum-style path params and Lorem Toneflix-style query params. Mix and match freely."
      />

      <div className="mx-auto max-w-4xl">
        <EndpointGroup title="Picsum-style">
          <EndpointRow
            path={
              <>
                /<EpParam>{'{width}'}</EpParam>
              </>
            }
            description="Random image, square crop to width × width"
          />
          <EndpointRow
            path={
              <>
                /<EpParam>{'{width}'}</EpParam>/<EpParam>{'{height}'}</EpParam>
              </>
            }
            description="Random image, exact dimensions. Append .webp / .avif / .png for format."
          />
          <EndpointRow
            path={
              <>
                /id/<EpParam>{'{id}'}</EpParam>/<EpParam>{'{width}'}</EpParam>/
                <EpParam>{'{height}'}</EpParam>
              </>
            }
            description="Deterministic: always returns the same image by file ID"
          />
          <EndpointRow
            path={
              <>
                /seed/<EpParam>{'{seed}'}</EpParam>/
                <EpParam>{'{width}'}</EpParam>/<EpParam>{'{height}'}</EpParam>
              </>
            }
            description="Seeded random: same seed always returns same image"
          />
          <EndpointRow
            path={
              <>
                /category/<EpParam>{'{category}'}</EpParam>/
                <EpParam>{'{width}'}</EpParam>/<EpParam>{'{height}'}</EpParam>
              </>
            }
            description="Random image from a specific category, resized to dimensions"
            badge={
              <span className="rounded bg-[#e85d26]/10 px-2 py-1 font-mono text-[0.62rem] font-medium uppercase tracking-[0.06em] text-[#e85d26]">
                New
              </span>
            }
          />
        </EndpointGroup>

        <EndpointGroup
          title={
            <>
              Lorem Toneflix–compatible{' '}
              <code className="text-[0.72rem] text-[#7a7a85]">/images/*</code>
            </>
          }
        >
          <EndpointRow
            path="/images"
            description={
              <>
                Random image. Use <code className="font-mono">?w=</code> and{' '}
                <code className="font-mono">?h=</code> to set dimensions.
              </>
            }
          />
          <EndpointRow
            path={
              <>
                /images/<EpParam>{'{category}'}</EpParam>
              </>
            }
            description="Random image from category. Supports avatar, nature, technology, etc."
          />
          <EndpointRow
            path={
              <>
                /images/image/<EpParam>{'{id}'}</EpParam>
              </>
            }
            description={
              <>
                Specific image by file ID. Combine with{' '}
                <code className="font-mono">?text=true</code> to discover IDs.
              </>
            }
          />
        </EndpointGroup>

        <EndpointGroup title="Shared query parameters">
          {[
            [
              '?w=',
              'N',
              ' &h=',
              'N',
              'Output width / height (Lorem Toneflix style). Alias for path params.',
            ],
            [
              '?filters=',
              'f1,f2:v',
              '',
              '',
              'Comma-separated filters with optional values. E.g. ?filters=greyscale,blur:5',
            ],
            [
              '?text=',
              'true|string',
              '',
              '',
              'Overlay text on the image. Pass true to use the image file name.',
            ],
            [
              '?seed=',
              'anything',
              '',
              '',
              'Deterministic random. Any unknown query param also acts as a seed.',
            ],
          ].map(([prefix, firstParam, middle, secondParam, description]) => (
            <EndpointRow
              key={`${prefix}-${firstParam}`}
              method="PARAM"
              variant="param"
              path={
                <>
                  {prefix}
                  <EpParam>{firstParam}</EpParam>
                  {middle}
                  {secondParam ? <EpParam>{secondParam}</EpParam> : null}
                </>
              }
              description={description}
            />
          ))}
        </EndpointGroup>
      </div>
    </section>
  );
}
