export function StatsSection() {
  return (
    <div className="grid grid-cols-2 border-y border-black/10 md:grid-cols-4">
      {[
        ['7', 'Image formats'],
        ['6+', 'Filter effects'],
        ['∞', 'Seeds'],
        ['0ms', 'Cold start'],
      ].map(([num, label]) => (
        <div
          key={label}
          className="border-b border-r border-black/10 px-6 py-6 last:border-r-0 md:border-b-0 md:px-8"
        >
          <div className="mb-1 font-serif text-4xl leading-none text-[#0e0e0f]">
            {num}
          </div>
          <div className="text-xs uppercase tracking-[0.08em] text-[#7a7a85]">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
