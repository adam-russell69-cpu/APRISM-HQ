import Link from "next/link";

export function RDHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <section><Link href="/hq/rd" className="text-xs uppercase tracking-[0.2em] text-[#b79a62]">‹ Outpost R&D</Link><h1 className="mt-3 text-3xl font-semibold">{title}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#aaa398]">{subtitle}</p></section>;
}

export function Card({ title, children, tag }: { title: string; children: React.ReactNode; tag?: string }) {
  return <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="flex items-start justify-between gap-3"><h2 className="text-lg font-medium">{title}</h2>{tag ? <span className="rounded-full border border-[#b79a62]/30 px-2 py-1 text-[9px] uppercase tracking-wider text-[#cbb47f]">{tag}</span> : null}</div><div className="mt-3 space-y-2 text-sm leading-6 text-[#aaa398]">{children}</div></section>;
}

export function Bullets({ items }: { items: string[] }) {
  return <ul className="space-y-2">{items.map((item) => <li key={item} className="flex gap-2"><span className="text-[#b79a62]">•</span><span>{item}</span></li>)}</ul>;
}
