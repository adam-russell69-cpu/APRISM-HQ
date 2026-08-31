import type { Metadata } from "next";
import { AssessmentIntakeForm } from "@/components/marketing/assessment-intake-form";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Property Assessment Intake | APRISM",
  description: "Complete the private APRISM Property Assessment Intake before a scheduled luxury home stewardship assessment in Park City or Summit County.",
  robots: { index: false, follow: false },
};

export default function PropertyAssessmentIntakePage() {
  return <main>
    <PageHero eyebrow="Scheduled Assessment" title="Prepare the property story before we arrive." intro="A thoughtful baseline begins with the context only an owner can provide—how the residence is used, who cares for it, what has changed, and what matters most." />
    <section className="bg-[#ebe8df] py-16 text-[#171a19] sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="mb-10 grid gap-6 border-b border-black/12 pb-10 lg:grid-cols-[0.7fr_1.3fr]"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#8f713d]">Client Property Assessment Intake</p><div><h2 className="font-serif text-4xl leading-tight sm:text-5xl">Operational context, gathered with discretion.</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-black/52">Complete what is known and leave non-required details blank when they do not apply. Do not enter alarm passwords, gate codes, or financial information.</p></div></div>
        <AssessmentIntakeForm />
      </div>
    </section>
  </main>;
}
