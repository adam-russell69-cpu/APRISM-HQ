import { ArrowUpRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/lib/marketing";
import { PageHero } from "./page-hero";

type EditorialMedia = {
  src: string;
  alt: string;
  eyebrow: string;
  caption?: string;
};

type ServicePageProps = {
  service: Service;
  editorialMedia?: EditorialMedia;
};

export function ServicePage({ service, editorialMedia }: ServicePageProps) {
  return (
    <main>
      <PageHero eyebrow={service.eyebrow} title={service.title} intro={service.intro} />
      {editorialMedia ? (
        <section className="bg-[#0c0f0f] px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <figure className="relative mx-auto max-w-[90rem] overflow-hidden border-y border-white/10">
            <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/7]">
              <Image
                src={editorialMedia.src}
                alt={editorialMedia.alt}
                fill
                sizes="(max-width: 639px) calc(100vw - 2.5rem), (max-width: 1023px) calc(100vw - 4rem), min(90rem, calc(100vw - 6rem))"
                className="object-cover object-[68%_50%] sm:object-center"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,9,0.72)_0%,rgba(7,9,9,0.08)_58%),linear-gradient(0deg,rgba(7,9,9,0.72)_0%,transparent_48%)]"
              />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[#c7a76b]">
                {editorialMedia.eyebrow}
              </p>
              {editorialMedia.caption ? (
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/64 sm:text-base sm:leading-7">
                  {editorialMedia.caption}
                </p>
              ) : null}
            </figcaption>
          </figure>
        </section>
      ) : null}
      <section className="bg-[#efede6] py-20 text-[#171a19] sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#8f713d]">Scope of care</p>
            <h2 className="mt-5 max-w-sm font-serif text-5xl leading-[0.94] tracking-[-0.03em]">Every detail has a place in the record.</h2>
          </div>
          <ul className="grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2">
            {service.services.map((item) => (
              <li key={item} className="flex min-h-24 items-center gap-4 bg-[#f7f5ee] px-5 py-6 text-sm leading-6">
                <Check aria-hidden="true" className="size-4 shrink-0 text-[#9c7a41]" />{item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="border-y border-white/10 bg-[#111414] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#c7a76b]">The stewardship difference</p>
            <p className="mt-6 font-serif text-4xl leading-tight text-white/88 sm:text-5xl">{service.promise}</p>
          </div>
          <div className="mt-14 grid gap-px border border-white/10 bg-white/10 md:grid-cols-3">
            {service.outcomes.map((outcome, index) => (
              <article key={outcome.title} className="bg-[#0d1010] p-7 sm:p-9">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/28">0{index + 1}</p>
                <h3 className="mt-8 font-serif text-3xl">{outcome.title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/48">{outcome.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#b99b62] py-16 text-[#101211] sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-black/55">Begin with clarity</p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">Let us understand the property before we recommend the program.</h2>
          </div>
          <Link href="/contact" className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 border border-black/30 px-6 text-[0.66rem] font-semibold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white">Request an assessment <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
        </div>
      </section>
    </main>
  );
}
