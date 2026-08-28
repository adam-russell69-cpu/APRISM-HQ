import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { memberships } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Property Stewardship Memberships",
  description: "APRISM membership options for proactive home care, home watch, estate stewardship, and private-client property oversight in Park City.",
};

export default function MembershipsPage() {
  return (
    <main>
      <PageHero eyebrow="Stewardship Memberships" title="Consistent care, calibrated to the property." intro="Recurring stewardship creates the continuity required to understand a property, anticipate its needs, and coordinate care without starting over each season." />
      <section className="bg-[#efede6] py-20 text-[#171a19] sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-px border border-black/12 bg-black/12 lg:grid-cols-2 xl:grid-cols-4">
            {memberships.map((membership) => (
              <article key={membership.name} className={`relative flex min-h-[34rem] flex-col p-7 sm:p-8 ${membership.featured ? "bg-[#18201d] text-white" : "bg-[#f7f5ee]"}`}>
                {membership.featured ? <p className="absolute right-5 top-5 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[#d8bd88]">Most requested</p> : null}
                <p className={`text-[0.6rem] font-semibold uppercase tracking-[0.2em] ${membership.featured ? "text-[#d8bd88]" : "text-[#8f713d]"}`}>APRISM</p>
                <h2 className="mt-8 font-serif text-4xl leading-none">{membership.name}</h2>
                <div className="mt-7 flex items-end gap-1"><p className="font-serif text-4xl leading-none">{membership.price}</p><p className={`pb-1 text-xs ${membership.featured ? "text-white/45" : "text-black/45"}`}>{membership.cadence}</p></div>
                <p className={`mt-6 min-h-24 text-sm leading-6 ${membership.featured ? "text-white/52" : "text-black/55"}`}>{membership.description}</p>
                <ul className={`mt-6 grid gap-4 border-t pt-6 text-sm ${membership.featured ? "border-white/12 text-white/70" : "border-black/12 text-black/68"}`}>
                  {membership.features.map((feature) => <li key={feature} className="flex gap-3"><Check aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${membership.featured ? "text-[#d8bd88]" : "text-[#8f713d]"}`} /><span>{feature}</span></li>)}
                </ul>
                <Link href="/contact" className={`mt-auto inline-flex min-h-12 items-center justify-center border px-4 text-center text-[0.62rem] font-semibold uppercase tracking-[0.15em] transition ${membership.featured ? "border-[#c7a76b]/60 text-[#e4cc9e] hover:bg-[#c7a76b] hover:text-black" : "border-black/22 hover:bg-black hover:text-white"}`}>Request an assessment</Link>
              </article>
            ))}
          </div>
          <div className="mt-12 grid gap-px border border-black/12 bg-black/12 md:grid-cols-3">
            {[
              ["Property Assessment / Onboarding", "$495"],
              ["Standard field service", "$125 / hour"],
              ["Priority / after-hours", "$185 / hour"],
            ].map(([label, price]) => <div key={label} className="bg-[#e8e5dc] p-6"><p className="text-xs uppercase tracking-[0.14em] text-black/45">{label}</p><p className="mt-3 font-serif text-3xl">{price}</p></div>)}
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-6 text-black/50">Memberships establish scheduled oversight, priority, and record continuity. Field labor, materials, third-party vendor charges, and project work are billed separately unless expressly included in a written service plan. Membership labor is not unlimited.</p>
        </div>
      </section>
      <section className="bg-[#111414] py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-12">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#c7a76b]">A measured recommendation</p>
          <div><h2 className="font-serif text-5xl leading-tight">The right level of stewardship depends on occupancy, systems, exposure, and expectations—not simply square footage.</h2><p className="mt-7 max-w-2xl text-sm leading-7 text-white/46">Every relationship begins with a property assessment. We use it to understand current condition, documentation, maintenance history, and the practical cadence of care.</p></div>
        </div>
      </section>
    </main>
  );
}
