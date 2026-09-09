import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Park City & Summit County Service Area",
  description: "APRISM serves luxury homes in Park City, Deer Valley, Promontory, and select Summit County and Wasatch Back communities.",
  alternates: { canonical: "/service-area" },
  openGraph: { url: "/service-area" },
};

const areas = [
  ["Park City", "Old Town, Park Meadows, Thaynes Canyon, and surrounding Park City neighborhoods."],
  ["Deer Valley", "Slope-side and private residential communities across upper and lower Deer Valley."],
  ["Promontory", "Estate and second-home stewardship within Promontory and nearby communities."],
  ["Summit County", "Select properties throughout the Snyderville Basin and Wasatch Back by assessment."],
];

export default function ServiceAreaPage() {
  return (
    <main>
      <PageHero eyebrow="Service Area" title="Stewardship rooted in the Wasatch Back." intro="Local response matters. APRISM focuses on a defined service area so inspections, coordination, and follow-through remain consistent in every season." />
      <section className="relative overflow-hidden bg-[#efede6] py-20 text-[#171a19] sm:py-28">
        <div className="area-contours absolute inset-y-0 right-0 w-[58%] opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-px border border-black/12 bg-black/12 md:grid-cols-2">
            {areas.map(([area, copy], index) => <article key={area} className="min-h-64 bg-[#f7f5ee] p-7 sm:p-9"><p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-[#8f713d]">0{index + 1}</p><h2 className="mt-12 font-serif text-4xl">{area}</h2><p className="mt-5 max-w-md text-sm leading-6 text-black/52">{copy}</p></article>)}
          </div>
          <div className="mt-14 max-w-3xl"><h2 className="font-serif text-4xl leading-tight sm:text-5xl">Outside the core service area?</h2><p className="mt-5 text-sm leading-7 text-black/54">APRISM evaluates select properties based on location, scope, access, and the cadence of care required. Multi-property and private-client relationships may support a broader footprint.</p><Link href="/contact" className="mt-7 inline-flex min-h-12 items-center justify-center bg-[#171a19] px-6 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white">Discuss your property</Link></div>
        </div>
      </section>
    </main>
  );
}
