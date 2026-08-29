import Image from "next/image";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
  index?: string;
};

export function PageHero({ eyebrow, title, intro, index = "APRISM" }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#0c0f0f] pb-20 pt-44 sm:pb-28 sm:pt-52">
      <Image
        src="/images/aprism-park-city-estate-hero.png"
        alt="A mountain estate overlooking the Wasatch Back at blue hour"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[66%_55%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,9,0.96)_0%,rgba(7,9,9,0.78)_45%,rgba(7,9,9,0.25)_100%),linear-gradient(0deg,rgba(7,9,9,0.7),transparent_55%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.25fr_1fr]">
          <p className="pt-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#c7a76b]">{index}</p>
          <div className="max-w-4xl">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.25em] text-white/48">{eyebrow}</p>
            <h1 className="mt-6 font-serif text-[clamp(3.3rem,8vw,7.4rem)] font-normal leading-[0.86] tracking-[-0.045em] text-[#f1efe9]">{title}</h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-white/56 sm:text-lg">{intro}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
