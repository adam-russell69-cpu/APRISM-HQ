import Link from "next/link";

export default function PropertyPage(){return <div className="space-y-8">
 <section className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#b79a62]">APRISM</p><h1 className="mt-2 text-3xl font-semibold">Property</h1><p className="mt-2 text-sm text-[#aaa398]">Jobs, clients and recurring stewardship.</p></div><Link href="/admin/clients" className="rounded-xl bg-[#c5aa72] px-4 py-3 text-sm font-semibold text-[#151513]">Clients</Link></section>
 {['Active jobs','Clients','Recurring'].map((title,i)=><section key={title} className="space-y-3"><h2 className="text-lg font-medium">{title}</h2><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-[#918b82]">{i===0?'No active property jobs.':i===1?'Existing APRISM client records remain available in Admin while HQ V1 is connected.':'Recurring relationships will surface here.'}</div></section>)}
 </div>}
