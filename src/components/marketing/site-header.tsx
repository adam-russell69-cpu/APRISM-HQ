"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/property-services", label: "Services" },
  { href: "/estate-management", label: "Estate Management" },
  { href: "/memberships", label: "Memberships" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0b0d0d]/35 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="relative z-50 text-lg font-semibold tracking-[0.34em]" onClick={() => setOpen(false)}>
          APRISM
        </Link>
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
          <Link href="/contact" className="hidden border border-[#c7a76b]/60 px-4 py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[#e0c58f] transition hover:bg-[#c7a76b] hover:text-[#0b0d0d] md:inline-flex">
            Property Assessment
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
