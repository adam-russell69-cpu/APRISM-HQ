"use client";

import { Building2, ClipboardCheck, FileText, Home, Menu, Settings, UserRound, Wrench, X, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/portal", label: "Overview", icon: Home },
  { href: "/portal/properties", label: "Properties", icon: Building2 },
  { href: "/portal/inspections", label: "Inspections", icon: ClipboardCheck },
  { href: "/portal/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/portal/issues", label: "Issues", icon: Zap },
  { href: "/portal/documents", label: "Documents", icon: FileText },
  { href: "/portal/requests", label: "Requests", icon: Settings },
  { href: "/portal/profile", label: "Profile", icon: UserRound },
];

function PortalNavigation({ onNavigate, signOutAction }: { onNavigate?: () => void; signOutAction: () => Promise<void> }) {
  return (
    <>
      <div className="px-6 pb-7 pt-7"><Link href="/portal" onClick={onNavigate} className="text-lg font-semibold tracking-[0.32em] text-white">APRISM</Link><p className="mt-2 text-[0.54rem] uppercase tracking-[0.2em] text-white/32">Private Client Portal</p></div>
      <nav aria-label="Portal navigation" className="flex-1 px-3">
        {navItems.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={onNavigate} className="flex items-center gap-3 border-l border-transparent px-4 py-3 text-xs font-medium text-white/48 transition hover:border-[#c7a76b] hover:bg-white/[0.04] hover:text-white"><Icon aria-hidden="true" className="size-4" />{item.label}</Link>; })}
      </nav>
      <div className="mx-4 mb-4 border border-white/10 p-4"><p className="text-[0.54rem] font-semibold uppercase tracking-[0.16em] text-[#d6b879]">MVP preview</p><p className="mt-2 text-[0.66rem] leading-5 text-white/35">Sample property data. Live records appear after APRISM Supabase is connected.</p></div>
      <form action={signOutAction} className="mx-4 mb-6"><button type="submit" className="flex min-h-11 w-full items-center justify-center border border-white/12 text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-white/45 transition hover:text-white">Sign out</button></form>
    </>
  );
}

export function PortalShell({ children, signOutAction }: { children: React.ReactNode; signOutAction: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eeece6] text-[#1b1e1d] lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-black/15 bg-[#101312] lg:flex"><PortalNavigation signOutAction={signOutAction} /></aside>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 bg-[#eeece6]/90 px-5 backdrop-blur lg:hidden"><Link href="/portal" className="text-sm font-semibold tracking-[0.28em]">APRISM</Link><button type="button" aria-label={open ? "Close portal navigation" : "Open portal navigation"} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="inline-flex size-10 items-center justify-center border border-black/12">{open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}</button></header>
      {open ? <div className="fixed inset-0 z-50 flex flex-col bg-[#101312] lg:hidden"><button type="button" aria-label="Close portal navigation" onClick={() => setOpen(false)} className="absolute right-5 top-5 inline-flex size-10 items-center justify-center border border-white/12 text-white"><X aria-hidden="true" className="size-5" /></button><PortalNavigation signOutAction={signOutAction} onNavigate={() => setOpen(false)} /></div> : null}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
