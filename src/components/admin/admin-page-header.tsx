import type { ReactNode } from "react";

export function AdminPageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="flex flex-col gap-6 border-b border-black/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
    <div className="max-w-3xl">
      {eyebrow ? <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#88682f]">{eyebrow}</p> : null}
      <h1 className="mt-2 font-serif text-4xl leading-none text-[#171a19] sm:text-5xl">{title}</h1>
      {description ? <p className="mt-4 max-w-2xl text-sm leading-7 text-black/50">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
  </header>;
}

export const adminPrimaryButton = "inline-flex min-h-11 items-center justify-center gap-2 bg-[#171a19] px-5 text-xs font-semibold text-white transition hover:bg-[#2a2e2c]";
export const adminSecondaryButton = "inline-flex min-h-11 items-center justify-center gap-2 border border-black/15 bg-white px-5 text-xs font-semibold text-black/70 transition hover:border-black/30 hover:text-black";
export const adminQuietButton = "inline-flex min-h-11 items-center justify-center gap-2 px-3 text-xs font-semibold text-black/52 transition hover:text-black";
