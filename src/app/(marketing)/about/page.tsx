import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "About APRISM",
  description: "APRISM is a Park City luxury asset stewardship company built around continuity, documentation, preventive care, and accountable coordination.",
};

const principles = [
  ["Preventive by design", "We look for patterns, upcoming needs, and small condition changes before urgency dictates the response."],
  ["Documented with purpose", "The record exists to improve decisions: what was observed, what changed, who handled it, and what comes next."],
  ["Discreet by default", "Private residences require judgment, careful communication, and respect for the routines of owners and guests."],
  ["Accountable through completion", "Coordination is only useful when someone remains responsible for the final outcome."],
];

const founderCredentials = [
  "More than 25 years across technical service, maintenance, hospitality, engineering, and operations",
  "Motorcycle Mechanics Institute training and Harley-Davidson service expertise",
  "Preventive-maintenance leadership, building systems, vendor management, and quality control",
  "A career centered on keeping valuable assets operational and customers confident",
];

export default function AboutPage() {
  return (
    <main>
      <PageHero eyebrow="About APRISM" title="A higher standard of ownership support." intro="APRISM was created for valuable homes and specialty assets that deserve a consistent steward—not a changing list of disconnected service calls." />
      <section className="bg-[#efede6] py-20 text-[#171a19] sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-12">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#8f713d]">Our point of view</p>
          <div>
            <h2 className="font-serif text-[clamp(3rem,6vw,5.6rem)] leading-[0.92] tracking-[-0.04em]">The value is not only in the repair. It is in the continuity.</h2>
            <p className="mt-8 max-w-2xl text-base leading-8 text-black/56">Mountain properties are exposed to weather, vacancy, complex equipment, seasonal transitions, and a network of specialized vendors. APRISM holds the full context so every decision builds on what came before.</p>
          </div>
        </div>
        <div className="mx-auto mt-16 grid max-w-7xl gap-px border border-black/12 bg-black/12 px-0 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map(([title, copy], index) => <article key={title} className="bg-[#f7f5ee] p-7"><p className="text-[0.56rem] uppercase tracking-[0.2em] text-black/30">0{index + 1}</p><h3 className="mt-10 font-serif text-3xl">{title}</h3><p className="mt-5 text-sm leading-6 text-black/52">{copy}</p></article>)}
        </div>
      </section>
      <section className="editorial-grid bg-[#f7f5ee] py-20 text-[#171a19] sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#8f713d]">Founder · Adam Russell</p>
            <h2 className="mt-6 font-serif text-[clamp(3rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.04em]">Built from a lifetime of stewardship.</h2>
          </div>
          <div className="lg:pt-16">
            <p className="max-w-2xl text-base leading-8 text-black/58">APRISM was founded by Adam Russell after more than 25 years working where technical judgment, preventive maintenance, service leadership, and hospitality meet. Across motorcycles, facilities, property systems, and operations, the lesson remained the same: expensive failures usually begin as small conditions that were not noticed, documented, communicated, or addressed early enough.</p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-black/58">APRISM turns that experience into one accountable relationship for the care of exceptional homes and specialty assets.</p>
            <ul className="mt-9 grid gap-4 border-t border-black/12 pt-7 text-sm leading-6 text-black/62">
              {founderCredentials.map((credential) => <li key={credential} className="flex gap-4"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-[#a7864e]" />{credential}</li>)}
            </ul>
          </div>
        </div>
      </section>
      <section className="bg-[#c4a368] py-16 text-[#101211] sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-3 lg:px-12">
          <div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-black/50">Mission</p><p className="mt-5 font-serif text-3xl leading-tight">Proactive stewardship through disciplined systems, thoughtful craftsmanship, and concierge-level service.</p></div>
          <div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-black/50">Vision</p><p className="mt-5 font-serif text-3xl leading-tight">To become the Mountain West’s most trusted luxury asset stewardship company.</p></div>
          <div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-black/50">Brand promise</p><p className="mt-5 font-serif text-3xl leading-tight">If it matters to our client, it matters to APRISM.</p></div>
        </div>
      </section>
      <section className="bg-[#111414] py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#c7a76b]">The APRISM model</p><p className="mt-7 font-serif text-4xl leading-tight text-white/90 sm:text-6xl">One relationship.<br />One property record.<br />One maintenance strategy.<br />One accountable steward.</p><Link href="/contact" className="mt-10 inline-flex min-h-14 items-center justify-center bg-[#c7a76b] px-7 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-black">Begin a conversation</Link></div>
      </section>
    </main>
  );
}
