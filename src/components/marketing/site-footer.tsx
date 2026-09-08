import Link from "next/link";
import { BrandSignature } from "./brand-signature";

const footerLinks = [
  ["Property Services", "/property-services"],
  ["Estate Management", "/estate-management"],
  ["Home Watch", "/home-watch"],
  ["New Home Stewardship", "/new-home-stewardship"],
  ["APRISM Moto", "/moto"],
  ["Memberships", "/memberships"],
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#080909]">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-12 lg:py-20">
        <div>
          <BrandSignature />
          <p className="mt-6 max-w-sm font-serif text-3xl leading-tight text-white/80">Luxury Asset Stewardship.<br />Managing What Matters.</p>
        </div>
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#c7a76b]">Stewardship</p>
          <div className="mt-5 grid gap-3 text-sm text-white/50">
            {footerLinks.map(([label, href]) => <Link key={href} href={href} className="transition hover:text-white">{label}</Link>)}
          </div>
        </div>
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#c7a76b]">Park City</p>
          <p className="mt-5 text-sm leading-6 text-white/50">Serving Park City, Deer Valley, Promontory, and select properties throughout Summit County and the Wasatch Back.</p>
          <Link href="/contact" className="mt-6 inline-flex text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[#d7ba82]">Begin a conversation →</Link>
          <div className="mt-6 flex gap-5 text-xs text-white/36"><Link href="/privacy" className="transition hover:text-white">Privacy</Link><Link href="/terms" className="transition hover:text-white">Terms</Link></div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-5 py-6 text-[0.62rem] uppercase tracking-[0.14em] text-white/28 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>© {new Date().getFullYear()} APRISM LLC. All rights reserved.</p>
        <p>Discreet care for exceptional properties.</p>
      </div>
    </footer>
  );
}
