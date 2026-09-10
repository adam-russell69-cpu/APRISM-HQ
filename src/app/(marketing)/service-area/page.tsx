import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Park City & Wasatch Back Service Area | APRISM",
  description: "APRISM provides home watch, property maintenance, and estate stewardship across Park City, Deer Valley, Promontory, Heber, Midway, Kamas, and select Wasatch Back communities.",
  alternates: { canonical: "/service-area" },
  openGraph: { url: "/service-area" },
};

const areas = [
  ["Park City", "Old Town, Park Meadows, Thaynes Canyon, Prospector, Jeremy Ranch, Pinebrook, and surrounding Park City neighborhoods."],
  ["Deer Valley", "Slope-side and private residential communities across Deer Valley, including seasonal and second-home stewardship needs."],
  ["Promontory", "Estate and second-home stewardship within Promontory and nearby gated communities, with documented local oversight."],
  ["Heber & Midway", "Property maintenance, home watch, and stewardship for primary and second homes throughout the Heber Valley."],
  ["Kamas & Oakley", "Select homes in Kamas, Oakley, Francis, and the eastern Wasatch Back where service cadence and access are a good fit."],
  ["Summit County", "Select properties throughout the Snyderville Basin and Summit County by assessment, including multi-property relationships."],
];

const services = [
  "Documented home watch visits",
  "Preventive property maintenance",
  "Minor repairs and troubleshooting",
  "Seasonal opening and closing support",
  "Vendor and contractor coordination",
  "Estate and second-home stewardship",
  "Arrival and departure preparation",
  "New-home documentation and onboarding",
];

export default function ServiceAreaPage() {
  return (
    <main>
      <PageHero eyebrow="Service Area" title="Stewardship rooted in the Wasatch Back." intro="Local response matters. APRISM focuses on a defined service area so inspections, coordination, and follow-through remain consistent in every season." />
      <section className="relative overflow-hidden bg-[#efede6] py-20 text-[#171a19] sm:py-28">
        <div className="area-contours absolute inset-y-0 right-0 w-[58%] opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#8f713d]">Park City to the Heber Valley</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">Local property care where mountain conditions make local presence matter.</h2>
            <p className="mt-6 text-base leading-8 text-black/58">APRISM supports homeowners, second-home owners, private estates, and select property-management partners across the Wasatch Back. Our core work combines documented home watch, preventive maintenance, minor repair, vendor coordination, and ongoing estate stewardship. By keeping the service footprint intentional, we can preserve the response, documentation, and follow-through that the APRISM model depends on.</p>
          </div>

          <div className="mt-14 grid gap-px border border-black/12 bg-black/12 md:grid-cols-2">
            {areas.map(([area, copy], index) => (
              <article key={area} className="min-h-64 bg-[#f7f5ee] p-7 sm:p-9">
                <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-[#8f713d]">0{index + 1}</p>
                <h2 className="mt-12 font-serif text-4xl">{area}</h2>
                <p className="mt-5 max-w-md text-sm leading-6 text-black/52">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111414] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#c7a76b]">Services across the region</p>
            <h2 className="mt-5 max-w-md font-serif text-4xl leading-tight text-white sm:text-5xl">One local relationship across the details of the home.</h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/48">Whether the property is occupied year-round or sits vacant between visits, APRISM can build a service cadence around its actual condition, systems, location, and ownership needs.</p>
          </div>
          <ul className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
            {services.map((item) => (
              <li key={item} className="flex min-h-24 items-center gap-4 bg-[#0d1010] px-5 py-6 text-sm leading-6 text-white/68">
                <Check aria-hidden="true" className="size-4 shrink-0 text-[#c7a76b]" />{item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#f7f5ee] py-20 text-[#171a19] sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#8f713d]">Why the service area matters</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">Mountain-home stewardship is a local operating problem.</h2>
          </div>
          <div className="space-y-6 text-base leading-8 text-black/60">
            <p>Park City and Wasatch Back homes deal with conditions that can shift quickly: freeze cycles, snow accumulation, irrigation changes, power interruptions, leak risk, exterior weather exposure, contractor access, and long periods of vacancy. A service provider who is physically nearby can document those changes and coordinate the right response before distance becomes the problem.</p>
            <p>APRISM does not try to be a mass-market property-management company covering an unlimited map. Our service area is designed around practical response time and consistent quality. That makes the model especially well suited to second homes, luxury residences, and owners who want a known local steward rather than a rotating list of vendors.</p>
            <p>Properties outside the core area may still be a fit, particularly for multi-property clients, recurring estate-management relationships, or locations that align with an existing route. Every new relationship begins with an assessment of the property, access, systems, service cadence, and expectations.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#b99b62] py-16 text-[#101211] sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-black/55">Outside the core service area?</p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">Tell us where the property is and what kind of care it needs.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-black/62">APRISM evaluates select properties based on location, scope, access, and the cadence of care required. Multi-property and private-client relationships may support a broader footprint.</p>
          </div>
          <Link href="/contact" className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 border border-black/30 px-6 text-[0.66rem] font-semibold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white">Request a property assessment <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
        </div>
      </section>
    </main>
  );
}
