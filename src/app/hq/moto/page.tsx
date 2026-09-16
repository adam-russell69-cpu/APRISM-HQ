import Link from "next/link";

const Section = ({title,children}:{title:string;children:React.ReactNode}) => <section className="space-y-3"><h2 className="text-lg font-medium">{title}</h2>{children}</section>;
const Empty = ({children}:{children:React.ReactNode}) => <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-[#918b82]">{children}</div>;

export default function MotoPage(){
 return <div className="space-y-8">
  <section className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#b79a62]">Outpost</p><h1 className="mt-2 text-3xl font-semibold">Moto</h1><p className="mt-2 text-sm text-[#aaa398]">Repair orders and motorcycle history.</p></div><Link href="/hq/moto/ro/new" className="rounded-xl bg-[#c5aa72] px-4 py-3 text-sm font-semibold text-[#151513]">+ New RO</Link></section>
  <Section title="In shop"><Empty>No active repair orders.</Empty></Section>
  <Section title="Ready"><Empty>No motorcycles waiting for pickup.</Empty></Section>
  <Section title="Recent"><div className="rounded-2xl border border-[#b79a62]/25 bg-white/[0.035] p-4"><div className="flex justify-between gap-4"><div><p className="font-medium">Jim Schneider</p><p className="mt-1 text-sm text-[#aaa398]">2016 Heritage Softail · 35,315 mi</p><p className="mt-2 text-sm">Three-hole service</p></div><div className="text-right"><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-[#bdb7ac]">Demo RO #001</span><p className="mt-3 text-sm text-[#d7c08f]">Complete</p></div></div></div></Section>
 </div>;
}
