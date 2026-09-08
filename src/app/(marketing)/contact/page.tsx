import type { Metadata } from "next";
import Link from "next/link";
import { InquiryForm } from "@/components/marketing/inquiry-form";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Request a Property Assessment",
  description: "Request a private property assessment for estate management, home watch, preventive maintenance, or luxury home stewardship in Park City and Summit County.",
};

export default function ContactPage() {
  return (
    <main>
      <PageHero eyebrow="Private Inquiry" title="Begin with the property." intro="Tell us what you own, how you use it, and where greater continuity would make ownership easier. We will begin with a discreet conversation and a structured property assessment." />
      <section className="bg-[#efede6] py-16 text-[#171a19] sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.58fr_1.42fr] lg:px-12">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#8f713d]">Property Assessment</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight">A careful first look, not a sales walk-through.</h2>
            <p className="mt-6 text-sm leading-7 text-black/54">The $495 assessment documents current condition, immediate priorities, core systems, existing records, and the recommended cadence of stewardship.</p>
            <div className="mt-8 border-t border-black/12 pt-6 text-sm leading-7 text-black/52"><p>Park City · Deer Valley · Promontory</p><p>Select Summit County properties</p><p className="mt-4 text-xs uppercase tracking-[0.14em] text-black/35">Response typically within one business day.</p></div>
          </div>
          <InquiryForm />
        </div>
      </section>
      <section className="border-t border-white/10 bg-[#111413] py-16 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
          <div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#c7a76b]">Already scheduled for an assessment?</p><h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">Complete Property Assessment Intake</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/46">Share the property context APRISM needs before the site visit through a secure, structured intake.</p></div>
          <Link href="/property-assessment/intake" className="inline-flex min-h-14 shrink-0 items-center justify-center border border-[#c7a76b]/55 px-6 text-center text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#e0c58f] transition hover:bg-[#c7a76b] hover:text-black">Complete Property Assessment Intake</Link>
        </div>
      </section>
    </main>
  );
}
