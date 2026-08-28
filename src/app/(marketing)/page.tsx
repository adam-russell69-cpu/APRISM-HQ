import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { healthStatuses, services } from "@/lib/marketing";

export default function Home() {
  const primaryServices = services.slice(0, 4);

  return (
    <main>
      <section className="relative flex min-h-[780px] items-end pb-16 pt-36 sm:min-h-[820px] sm:pb-24 lg:min-h-screen lg:items-center lg:py-36">
        <div className="hero-atmosphere absolute inset-0" aria-hidden="true">
          <div className="hero-ridge hero-ridge-back" />
          <div className="hero-ridge hero-ridge-front" />
          <div className="hero-glow" />
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-6 text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-[#c7a76b]">Park City · Wasatch Back</p>
            <p className="mb-5 text-sm uppercase tracking-[0.22em] text-white/62">Luxury Asset Stewardship</p>
            <h1 className="font-serif text-[clamp(4.5rem,14vw,10.5rem)] font-medium leading-[0.66] tracking-[-0.06em] text-[#f1efe9]">APRISM</h1>
            <h2 className="mt-10 max-w-2xl font-serif text-[clamp(2.5rem,6vw,5.25rem)] font-normal leading-[0.92] tracking-[-0.035em]">Managing What Matters.</h2>
            <p className="mt-8 max-w-xl text-base leading-7 text-white/62 sm:text-lg sm:leading-8">Proactive property, estate, and specialty asset stewardship for Park City and the Wasatch Back.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex min-h-14 items-center justify-center bg-[#c7a76b] px-7 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#0b0d0d] transition hover:bg-[#ddc28c]">Request a Property Assessment</Link>
              <Link href="/property-services" className="inline-flex min-h-14 items-center justify-center border border-white/25 px-7 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/90 transition hover:border-[#c7a76b] hover:text-[#e0c58f]">Explore Stewardship Services</Link>
            </div>
          </div>
          <aside className="hidden border-l border-[#c7a76b]/35 pl-8 lg:block">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[#c7a76b]">The APRISM standard</p>
            <p className="mt-5 font-serif text-3xl leading-tight text-white/90">One relationship.<br />One property record.<br />One accountable steward.</p>
            <p className="mt-6 max-w-xs text-sm leading-6 text-white/48">Continuity for the systems, people, and details that keep a valuable property operating beautifully.</p>
          </aside>
        </div>
      </section>

      <section className="bg-[#efede6] py-20 text-[#171a19] sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-12">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#8f713d]">Beyond reactive service</p>
          </div>
          <div>
            <h2 className="max-w-4xl font-serif text-[clamp(2.8rem,6vw,5.6rem)] leading-[0.94] tracking-[-0.04em]">The operational memory of your property.</h2>
            <p className="mt-8 max-w-2xl text-base leading-8 text-black/58">APRISM does not simply repair problems. We maintain the operational history, systems, vendors, maintenance schedule, and condition of valuable properties and specialty assets.</p>
            <div className="mt-10 grid gap-6 border-t border-black/15 pt-8 sm:grid-cols-2">
              <p className="font-serif text-3xl leading-tight">One maintenance strategy.</p>
              <p className="text-sm leading-6 text-black/52">Decisions are made with the complete record in view—not as isolated service calls without context.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0e1111] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#c7a76b]">Stewardship services</p>
              <h2 className="mt-5 max-w-2xl font-serif text-5xl leading-none tracking-[-0.035em] sm:text-6xl">Care with context.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/44">A coordinated system spanning preventive care, estate oversight, documented home watch, and new-home onboarding.</p>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
            {primaryServices.map((service, index) => (
              <Link key={service.slug} href={`/${service.slug}`} className="group min-h-80 bg-[#0b0d0d] p-7 transition hover:bg-[#151817] sm:p-10">
                <div className="flex items-start justify-between">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/25">0{index + 1}</p>
                  <ArrowUpRight aria-hidden="true" className="size-5 text-[#c7a76b] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <h3 className="mt-20 max-w-md font-serif text-4xl leading-tight">{service.eyebrow.replace("APRISM ", "")}</h3>
                <p className="mt-5 max-w-md text-sm leading-6 text-white/45">{service.intro}</p>
              </Link>
            ))}
          </div>
          <Link href="/moto" className="mt-8 inline-flex items-center gap-3 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#d7ba82]">Explore APRISM Moto <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#131615] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#c7a76b]">APRISM Property Health</p>
              <h2 className="mt-5 font-serif text-5xl leading-none tracking-[-0.035em]">Condition made clear.</h2>
              <p className="mt-6 max-w-md text-sm leading-6 text-white/45">A shared language for what is operating well, what deserves observation, and where action protects the property.</p>
            </div>
            <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
              {healthStatuses.map((status) => (
                <article key={status.name} className="bg-[#0d1010] p-7">
                  <div className="flex items-center gap-3"><span className="size-2 rounded-full" style={{ backgroundColor: status.tone }} /><h3 className="text-xs font-semibold uppercase tracking-[0.16em]">{status.name}</h3></div>
                  <p className="mt-5 text-sm leading-6 text-white/44">{status.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#efede6] py-20 text-[#171a19] sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#8f713d]">The Wasatch Back</p>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <h2 className="font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] tracking-[-0.045em]">Local knowledge.<br />Exacting follow-through.</h2>
            <div>
              <p className="max-w-md text-base leading-8 text-black/56">Serving Park City, Deer Valley, Promontory, and select Summit County properties with care calibrated to mountain conditions and seasonal ownership.</p>
              <Link href="/service-area" className="mt-7 inline-flex items-center gap-3 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#7a5e2e]">View our service area <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#b99b62] py-16 text-[#101211] sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-black/55">Property assessment</p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">A thoughtful stewardship plan begins with the property itself.</h2>
          </div>
          <Link href="/contact" className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 border border-black/30 px-6 text-[0.66rem] font-semibold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white">Request an assessment <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
        </div>
      </section>
    </main>
  );
}
