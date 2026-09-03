"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import type { StaffAccount } from "@/lib/admin-account";
import { AdminSidebar } from "./admin-sidebar";

const sections = [
  ["/admin/assessments", "Assessments"],
  ["/admin/properties", "Properties"],
  ["/admin/clients", "Clients & Leads"],
  ["/admin/billing", "Billing"],
  ["/admin/requests", "Requests"],
  ["/admin/issues", "Issues"],
  ["/admin/documents", "Documents"],
  ["/admin/vendors", "Vendors"],
  ["/admin/settings", "Settings"],
] as const;

function sectionFor(pathname: string) {
  return sections.find(([path]) => pathname.startsWith(path))?.[1] ?? "Dashboard";
}

function contextualAction(pathname: string) {
  if (pathname.startsWith("/admin/assessments")) return { href: "/admin/assessments/new", label: "New Assessment" };
  if (pathname.startsWith("/admin/properties")) return { href: "/admin/properties/new", label: "Add Property" };
  return { href: "/admin/assessments/new", label: "New Assessment" };
}

export function AdminShell({ account, children }: { account: StaffAccount; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const action = contextualAction(pathname);

  return <div className="min-h-screen bg-[#eeece6] text-[#171a19] lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
    <aside className="print-hidden fixed inset-y-0 left-0 z-40 hidden w-[250px] lg:block"><AdminSidebar account={account} /></aside>
    {open ? <div className="print-hidden fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-black/55" onClick={() => setOpen(false)} aria-label="Close navigation" /><aside className="relative h-full w-[min(86vw,290px)] shadow-2xl"><AdminSidebar account={account} onNavigate={() => setOpen(false)} /></aside></div> : null}
    <div className="min-w-0 lg:col-start-2">
      <header className="print-hidden sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-black/10 bg-[#f7f5ef]/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <button type="button" className="flex size-11 items-center justify-center border border-black/10 bg-white lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">{open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}</button>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{sectionFor(pathname)}</p><p className="mt-0.5 hidden text-[0.68rem] text-black/38 sm:block">APRISM private operations workspace</p></div>
        <form action="/admin/properties" method="get" className="hidden w-full max-w-xs items-center border border-black/10 bg-white px-3 md:flex"><Search aria-hidden="true" className="size-4 text-black/30" /><label htmlFor="admin-search" className="sr-only">Search properties</label><input id="admin-search" name="q" placeholder="Search properties" className="min-h-10 w-full bg-transparent px-3 text-sm outline-none placeholder:text-black/30" /></form>
        <Link href={action.href} className="inline-flex min-h-10 items-center gap-2 bg-[#171a19] px-3.5 text-xs font-semibold text-white sm:px-4"><Plus aria-hidden="true" className="size-4" /><span className="hidden sm:inline">{action.label}</span></Link>
      </header>
      <div>{children}</div>
    </div>
  </div>;
}
