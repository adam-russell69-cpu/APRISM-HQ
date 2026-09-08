"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandSignature } from "./brand-signature";

const navItems = [
  { href: "/property-services", label: "Services" },
  { href: "/estate-management", label: "Estate Management" },
  { href: "/memberships", label: "Memberships" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/12 bg-[#090b0b]/72 backdrop-blur-md">
      <div className="mx-auto flex h-24 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
        <BrandSignature className="relative z-50" onClick={() => setOpen(false)} />
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white/64 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#d7ba82]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/portal" className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/55 transition hover:text-white sm:block">
            Client Portal
          </Link>
          <Link href="/contact" className="hidden bg-[#c7a76b] px-5 py-3 text-[0.6rem] font-semibold uppercase tracking-[0.17em] text-[#0b0d0d] transition hover:bg-[#e0c58f] md:inline-flex">
            Request Assessment
          </Link>
          <button type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="relative z-50 inline-flex size-11 items-center justify-center border border-white/15 text-white lg:hidden">
            {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 flex min-h-screen flex-col bg-[#0b0d0d] px-5 pb-10 pt-28 lg:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col border-t border-white/10">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="border-b border-white/10 py-5 font-serif text-3xl text-white/90">
                {item.label}
              </Link>
            ))}
            <Link href="/service-area" onClick={() => setOpen(false)} className="border-b border-white/10 py-5 font-serif text-3xl text-white/90">Service Area</Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="mt-8 inline-flex min-h-14 items-center justify-center bg-[#c7a76b] px-6 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#0b0d0d]">Request a Property Assessment</Link>
            <Link href="/portal" onClick={() => setOpen(false)} className="mt-4 inline-flex min-h-14 items-center justify-center border border-white/20 px-6 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white">Client Portal</Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
