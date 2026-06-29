import { cn, sectionSub, sectionTag, sectionTitle } from '../utils';

export function MethodBadge({
  children = 'GET',
  variant = 'get',
}: {
  children?: React.ReactNode;
  variant?: 'get' | 'param';
}) {
  return (
    <span
      className={cn(
        'shrink-0 rounded px-2 py-1 text-center font-mono text-[0.65rem] font-medium uppercase tracking-[0.07em]',
        variant === 'get' && 'bg-[#63c966]/20 text-[#63c966]',
        variant === 'param' && 'bg-blue-500/15 text-blue-700',
      )}
    >
      {children}
    </span>
  );
}

export function ApiRoute({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-[#0e0e0f] px-5 py-4">
      <MethodBadge>GET</MethodBadge>
      <code className="break-all font-mono text-[0.82rem] text-white/85">
        {children}
      </code>
    </div>
  );
}

export function ApiParamsTable({
  header,
  rows,
}: {
  header?: React.ReactNode;
  rows: Array<[string, string, string]>;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-[#e1dfd7]">
      <div className="grid grid-cols-[110px_70px_1fr] gap-4 border-b border-black/10 bg-[#eceae3] px-4 py-3 font-mono text-[0.65rem] font-medium uppercase tracking-[0.08em] text-[#7a7a85]">
        {header ?? (
          <>
            <span>Param</span>
            <span>Default</span>
            <span>Description</span>
          </>
        )}
      </div>

      {rows.map(([name, defaultValue, description]) => (
        <div
          key={name}
          className="grid grid-cols-[110px_70px_1fr] gap-4 border-b border-black/10 px-4 py-3 last:border-b-0"
        >
          <span className="font-mono text-xs text-[#e85d26]">{name}</span>
          <span className="font-mono text-xs text-[#7a7a85]">
            {defaultValue}
          </span>
          <span className="text-xs leading-5 text-[#7a7a85]">
            {description}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SectionHeading({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <>
      <div className={sectionTag}>{tag}</div>
      <div className={sectionTitle}>{title}</div>
      {subtitle ? <p className={sectionSub}>{subtitle}</p> : null}
    </>
  );
}
