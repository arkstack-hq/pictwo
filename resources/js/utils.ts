
export function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

export const pageSection = 'px-6 py-12 md:px-12 md:py-20'
export const sectionTag =
    'mb-3 font-mono text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#7a7a85]'
export const sectionTitle =
    'mb-4 font-serif text-3xl leading-tight tracking-[-0.02em] text-[#0e0e0f] sm:text-4xl lg:text-5xl'
export const sectionSub =
    'mb-12 max-w-xl text-base font-light leading-7 text-[#3a3a40]'

export const labelClass =
    'flex flex-col gap-1.5 text-xs font-medium tracking-[0.03em] text-[#3a3a40]'

export const inputClass =
    'w-full rounded-md border border-[#a1a1a1] bg-[#f5f4f0] px-3 py-2 font-mono text-sm text-[#0e0e0f] outline-none transition focus:border-[#3a3a40]'
