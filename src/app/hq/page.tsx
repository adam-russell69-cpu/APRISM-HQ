import Link from "next/link";

export default function TodayPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.22em] text-[#b79a62]">Today</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Good afternoon, Adam.</h1>
        <p className="mt-2 text-sm text-[#aaa398]">What are we working on?</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between"><h2 className="text-lg font-medium">Active work</h2></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <p className="text-sm font-medium">No active work</p>
          <p className="mt-1 text-sm text-[#918b82]">New Property jobs and Moto repair orders will appear here.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Attention</h2>
        <div className="rounded-2xl border border-white/10 p-4 text-sm text-[#bdb7ac]">✓ Nothing needs attention.</div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link href="/hq/property" className="rounded-2xl border border-[#b79a62]/30 bg-[#b79a62]/10 p-5"><span className="text-xs uppercase tracking-[0.18em] text-[#cbb47f]">New job</span><strong className="mt-2 block text-lg">Property</strong></Link>
        <Link href="/hq/moto" className="rounded-2xl border border-[#b79a62]/30 bg-[#b79a62]/10 p-5"><span className="text-xs uppercase tracking-[0.18em] text-[#cbb47f]">New RO</span><strong className="mt-2 block text-lg">Moto</strong></Link>
      </section>
    </div>
  );
}
