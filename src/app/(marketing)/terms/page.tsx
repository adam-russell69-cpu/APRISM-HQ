import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Website Terms",
  description: "Terms governing use of the APRISM LLC website and client portal.",
};

const sections = [
  ["Website information", "Website content describes APRISM’s general capabilities and is not a binding service proposal, inspection report, warranty, engineering opinion, or promise of emergency availability. Specific scope, pricing, cadence, and response expectations are established in a written agreement."],
  ["Licensed and specialty work", "APRISM may perform appropriate maintenance within its lawful scope and may coordinate qualified third-party providers for licensed, certified, or specialty work. Third-party work, materials, and vendor charges are governed by the applicable proposal or service agreement."],
  ["Memberships and pricing", "Published membership and hourly pricing is subject to property assessment, service area, complexity, access, and written scope. Membership labor is not unlimited. Project work, materials, travel, and third-party charges may be billed separately."],
  ["Client portal", "Portal access is personal to authorized users. Users must protect their credentials and promptly report suspected unauthorized access. Portal content reflects the current property record available to APRISM and does not replace emergency services or a licensed professional evaluation."],
  ["Intellectual property", "APRISM names, marks, site design, text, imagery, reports, and operating materials are owned by APRISM LLC or used with permission and may not be reproduced for commercial use without written authorization."],
];

export default function TermsPage() {
  return <main><PageHero eyebrow="APRISM LLC" title="Clear terms. Accountable relationships." intro="These terms govern use of the APRISM website and client portal. A signed service agreement controls each client relationship." /><section className="bg-[#efede6] py-20 text-[#171a19] sm:py-28"><div className="mx-auto max-w-4xl px-5 sm:px-8"><p className="text-xs uppercase tracking-[0.16em] text-black/40">Effective August 29, 2026</p><div className="mt-10 divide-y divide-black/12 border-y border-black/12">{sections.map(([title, copy]) => <section key={title} className="py-8"><h2 className="font-serif text-3xl">{title}</h2><p className="mt-4 text-sm leading-7 text-black/58">{copy}</p></section>)}</div><p className="mt-9 text-sm leading-7 text-black/55">Questions about these terms may be submitted through the <Link href="/contact" className="text-[#7a5d30] underline underline-offset-4">APRISM contact form</Link>.</p></div></section></main>;
}
