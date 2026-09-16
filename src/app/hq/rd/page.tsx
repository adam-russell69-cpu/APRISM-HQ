import Link from "next/link";

const areas = [
  ["Concepts", "Floor plans and operating concepts", "/hq/rd/concepts"],
  ["Properties", "Candidate sites and Outpost score", "/hq/rd/properties"],
  ["Financials", "Feasibility scenarios only", "/hq/rd/financials"],
  ["Design", "Renders, floor plans and brand studies", "/hq/rd/design"],
  ["Decisions", "Proceed, hold and reject log", "/hq/rd/decisions"],
];

export default function RDPage() {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs uppercase tracking-[0.22em] text-[#b79a62]">Research & Development</p>
          <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] uppercase tracking-wider text-[#918b82]">Not live operations</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold">Outpost Coffee & Moto</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#aaa398]">The working project room for the future Outpost concept: coffee, motorcycles and community. Planning material only. No customers, POS, inventory or operational workflows live here.</p>
      </section>

      <section className="grid gap-3">
        {areas.map(([title, desc, href]) => (
          <Link key={title} href={href} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition active:scale-[0.99] hover:border-[#b79a62]/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-medium">{title}</h2>
                <p className="mt-1 text-sm text-[#918b82]">{desc}</p>
              </div>
              <span className="text-xl text-[#b79a62]">›</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
