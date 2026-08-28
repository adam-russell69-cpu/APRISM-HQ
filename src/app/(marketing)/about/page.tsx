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
      <section className="bg-[#111414] py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#c7a76b]">The APRISM model</p><p className="mt-7 font-serif text-4xl leading-tight text-white/90 sm:text-6xl">One relationship.<br />One property record.<br />One maintenance strategy.<br />One accountable steward.</p><Link href="/contact" className="mt-10 inline-flex min-h-14 items-center justify-center bg-[#c7a76b] px-7 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-black">Begin a conversation</Link></div>
      </section>
    </main>
  );
}
