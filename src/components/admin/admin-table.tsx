import type { ReactNode } from "react";

export function AdminTable({ columns, children, className = "" }: { columns: string[]; children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden border border-black/10 bg-white ${className}`}>
    <div className="hidden border-b border-black/10 bg-[#f5f2eb] px-5 py-3 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-black/40 md:grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
      {columns.map((column) => <span key={column}>{column}</span>)}
    </div>
    <div className="divide-y divide-black/10">{children}</div>
  </div>;
}

export function AdminTableRow({ href, columns, children }: { href?: string; columns: number; children: ReactNode }) {
  const content = <div className="flex flex-col gap-3 px-5 py-4 text-sm md:grid md:items-center md:gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{children}</div>;
  return href ? <a href={href} className="block transition hover:bg-[#faf8f3] focus-visible:bg-[#faf8f3]">{content}</a> : content;
}

export function MobileLabel({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-black/35 md:hidden">{children}</span>;
}
