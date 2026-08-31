import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  Check,
  House,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UsdPrice } from "@/components/marketing/usd-price";
import { healthStatuses, memberships } from "@/lib/marketing";

const stewardshipServices = [
  { title: "Property Stewardship", copy: "Proactive care, preventive maintenance, and a living property record.", href: "/property-services", icon: House },
  { title: "Estate Management", copy: "Oversight, vendor coordination, projects, arrivals, and reporting.", href: "/estate-management", icon: UsersRound },
  { title: "Home Watch", copy: "Documented inspections and peace of mind while you are away.", href: "/home-watch", icon: ShieldCheck },
  { title: "New Home Stewardship", copy: "A structured operating record for a newly built or purchased home.", href: "/new-home-stewardship", icon: CalendarCheck2 },
];

export default function Home() {
  return (
    <main>
      <section className="relative flex min-h-[46rem] items-center overflow-hidden pt-24 sm:min-h-[50rem] lg:min-h-screen">
        <Image src="/images/aprism-park-city-estate-hero.png" alt="A luxury Park City mountain estate overlooking the Wasatch Back at blue hour" fill priority sizes="100vw" className="editorial-image object-cover object-[67%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,7,0.96)_0%,rgba(5,7,7,0.88)_35%,rgba(5,7,7,0.42)_68%,rgba(5,7,7,0.18)_100%),linear-gradient(0deg,rgba(5,7,7,0.62),transparent_50%)]" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-[90rem] px-5 py-24 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-[0.63rem] font-semibold uppercase tracking-[0.32em] text-[#d1b276]">Park City · Wasatch Back</p>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-white/70">Luxury Asset Stewardship</p>
            <h1 className="mt-5 max-w-xl font-serif text-[clamp(3.8rem,8vw,7.25rem)] font-normal leading-[0.82] tracking-[-0.045em] text-[#f4f0e8]">Managing What Matters.</h1>
            <p className="mt-8 max-w-lg text-base leading-8 text-white/72 sm:text-lg">Proactive property, estate, and specialty asset stewardship for Park City and the Wasatch Back.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex min-h-14 items-center justify-center bg-[#c7a76b] px-7 text-center text-[0.64rem] font-semibold uppercase tracking-[0.17em] text-[#0a0c0b] transition hover:bg-[#e0c58f]">Request a Property Assessment</Link>
              <Link href="/property-services" className="inline-flex min-h-14 items-center justify-center border border-white/35 bg-black/10 px-7 text-center text-[0.64rem] font-semibold uppercase tracking-[0.17em] text-white transition hover:border-[#c7a76b] hover:text-[#e0c58f]">Explore Services</Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 hidden border-t border-white/14 bg-black/20 backdrop-blur-sm md:block">
          <div className="mx-auto grid max-w-[90rem] grid-cols-3 divide-x divide-white/12 px-12 py-5 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/60">
            <span>Property · Estate · Specialty Assets</span>
            <span className="px-7">One relationship. One accountable steward.</span>
            <span className="px-7 text-right text-[#d1b276]">Park City, Utah</span>
          </div>
        </div>
      </section>

      <section className="editorial-grid bg-[#f2eee6] py-20 text-[#171918] sm:py-28">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#8b6b38]">The APRISM Standard</p>
            <h2 className="mt-5 font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[0.94] tracking-[-0.035em]">Luxury Asset Stewardship</h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-black/58 sm:text-base">We protect the operating condition, history, and value of exceptional homes through thoughtful oversight and exacting follow-through.</p>
          </div>
          <div className="mt-14 grid border-y border-black/14 md:grid-cols-2 xl:grid-cols-4">
            {stewardshipServices.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.href} href={service.href} className="group border-b border-black/14 px-6 py-9 transition hover:bg-white/55 md:nth-[odd]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0">
                  <Icon aria-hidden="true" strokeWidth={1.25} className="size-8 text-[#8d6d3b]" />
                  <h3 className="mt-7 font-serif text-2xl leading-tight">{service.title}</h3>
                  <p className="mt-3 text-xs leading-6 text-black/52">{service.copy}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#795b2e]">Learn more <ArrowRight aria-hidden="true" className="size-3.5 transition group-hover:translate-x-1" /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid min-h-[42rem] bg-[#0b0d0d] lg:grid-cols-2">
        <div className="relative min-h-[28rem] lg:min-h-full">
          <Image src="/images/aprism-mountain-interior.png" alt="A carefully maintained mountain estate interior overlooking snowy peaks" fill sizes="(min-width: 1024px) 50vw, 100vw" className="editorial-image object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden="true" />
        </div>
        <div className="flex items-center px-5 py-20 sm:px-10 lg:px-16 xl:px-24">
          <div className="max-w-xl">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#c7a76b]">Local expertise</p>
            <h2 className="mt-6 font-serif text-[clamp(3rem,5vw,5rem)] leading-[0.92] tracking-[-0.035em]">Trusted relationships. Exceptional results.</h2>
            <p className="mt-8 text-base leading-8 text-white/58">APRISM serves as the operational memory of your property—maintaining its systems, schedules, vendors, documentation, and condition with one complete record in view.</p>
            <div className="mt-10 grid grid-cols-3 border-y border-white/12 py-6">
              <div><p className="font-serif text-3xl text-[#d6b979]">Local</p><p className="mt-1 text-[0.55rem] uppercase tracking-[0.16em] text-white/35">Park City based</p></div>
              <div className="border-x border-white/12 px-5"><p className="font-serif text-3xl text-[#d6b979]">Private</p><p className="mt-1 text-[0.55rem] uppercase tracking-[0.16em] text-white/35">Discreet service</p></div>
              <div className="pl-5"><p className="font-serif text-3xl text-[#d6b979]">Proactive</p><p className="mt-1 text-[0.55rem] uppercase tracking-[0.16em] text-white/35">Care with context</p></div>
            </div>
            <Link href="/about" className="mt-9 inline-flex items-center gap-3 border border-[#c7a76b]/55 px-6 py-4 text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#e0c58f] transition hover:bg-[#c7a76b] hover:text-black">About APRISM <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f2eee6] py-20 text-[#171918] sm:py-28">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <div className="text-center">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#8b6b38]">Ongoing stewardship</p>
            <h2 className="mt-5 font-serif text-[clamp(2.8rem,5vw,4.8rem)] leading-none tracking-[-0.035em]">Memberships Designed for You</h2>
            <p className="mt-5 text-sm text-black/50">Simple to understand. Calibrated to the property. Built around peace of mind.</p>
          </div>
          <div className="mt-12 grid gap-px border border-black/14 bg-black/14 md:grid-cols-2 xl:grid-cols-4">
            {memberships.map((membership) => (
              <article key={membership.name} className={`flex min-h-[29rem] flex-col p-7 ${membership.featured ? "bg-[#141917] text-white" : "bg-[#f8f5ee]"}`}>
                <p className={`text-[0.55rem] font-semibold uppercase tracking-[0.2em] ${membership.featured ? "text-[#d4b779]" : "text-[#8b6b38]"}`}>{membership.featured ? "Most requested" : "APRISM Membership"}</p>
                <h3 className="mt-7 font-serif text-3xl">{membership.name}</h3>
                <div className="mt-5 flex items-end gap-1"><span className="font-serif text-3xl"><UsdPrice {...membership.price} /></span><span className={`pb-1 text-[0.65rem] ${membership.featured ? "text-white/40" : "text-black/40"}`}>{membership.cadence}</span></div>
                <p className={`mt-5 text-xs leading-6 ${membership.featured ? "text-white/50" : "text-black/52"}`}>{membership.description}</p>
                <ul className={`mt-6 grid gap-3 border-t pt-5 text-xs ${membership.featured ? "border-white/12 text-white/65" : "border-black/12 text-black/62"}`}>
                  {membership.features.slice(0, 3).map((feature) => <li key={feature} className="flex gap-2.5"><Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#a7864e]" />{feature}</li>)}
                </ul>
                <Link href="/memberships" className={`mt-auto inline-flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] ${membership.featured ? "text-[#d9bd83]" : "text-[#77592e]"}`}>View membership <ArrowRight aria-hidden="true" className="size-3.5" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#111413] py-20 sm:py-24">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-12">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-[#c7a76b]">APRISM Property Health</p>
            <h2 className="mt-5 font-serif text-5xl leading-none tracking-[-0.035em]">Condition made clear.</h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/46">One shared language for every inspection, issue, recommendation, and next action.</p>
          </div>
          <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
            {healthStatuses.map((status) => (
              <article key={status.name} className="bg-[#0b0d0d] p-7">
                <div className="flex items-center gap-3"><span className="size-2 rounded-full" style={{ backgroundColor: status.tone }} /><h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.17em]">{status.name}</h3></div>
                <p className="mt-4 text-xs leading-6 text-white/44">{status.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#c4a368] py-16 text-[#101211] sm:py-20">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-black/55">A private beginning</p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">A thoughtful stewardship plan begins with the property itself.</h2>
          </div>
          <Link href="/contact" className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 border border-black/35 px-6 text-[0.62rem] font-semibold uppercase tracking-[0.17em] transition hover:bg-black hover:text-white">Request an assessment <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
        </div>
      </section>
    </main>
  );
}
