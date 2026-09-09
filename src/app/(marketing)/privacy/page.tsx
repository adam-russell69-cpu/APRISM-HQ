import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How APRISM LLC handles website inquiries and client portal information.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy" },
};

const sections = [
  ["Information we collect", "When you request a property assessment, APRISM LLC collects the contact, property, service-interest, and message information you submit. Client portal accounts may also contain property records, service history, documents, photographs, and requests associated with an authorized property relationship."],
  ["How we use information", "We use information to respond to inquiries, evaluate service fit, provide and coordinate stewardship services, maintain property records, support client accounts, protect our systems, and meet legal or operational obligations."],
  ["How information is protected", "Portal records are protected through authenticated access and property-specific authorization. Public inquiry records are not readable through the website. We use service providers only where needed to operate the website, database, communications, and client services."],
  ["Your choices", "You may ask APRISM to correct or delete inquiry information, subject to applicable legal, contractual, security, and recordkeeping requirements. Do not submit highly sensitive access credentials, financial information, or emergency instructions through the public inquiry form."],
];

export default function PrivacyPage() {
  return <main><PageHero eyebrow="APRISM LLC" title="Privacy, handled with discretion." intro="This notice explains how information submitted through the APRISM website and client portal is used and protected." /><section className="bg-[#efede6] py-20 text-[#171a19] sm:py-28"><div className="mx-auto max-w-4xl px-5 sm:px-8"><p className="text-xs uppercase tracking-[0.16em] text-black/40">Effective August 29, 2026</p><div className="mt-10 divide-y divide-black/12 border-y border-black/12">{sections.map(([title, copy]) => <section key={title} className="py-8"><h2 className="font-serif text-3xl">{title}</h2><p className="mt-4 text-sm leading-7 text-black/58">{copy}</p></section>)}</div><p className="mt-9 text-sm leading-7 text-black/55">Questions about privacy or your information may be submitted through the <Link href="/contact" className="text-[#7a5d30] underline underline-offset-4">APRISM contact form</Link>.</p></div></section></main>;
}
