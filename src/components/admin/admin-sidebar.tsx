"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardCheck, CreditCard, FileText, Gauge, Handshake, LogOut, MessageSquareText, Settings, TriangleAlert, Users, Wrench } from "lucide-react";
import { adminSignOut } from "@/app/admin/actions";
import type { StaffAccount } from "@/lib/admin-account";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: Gauge, exact: true },
  { href: "/admin/assessments", label: "Assessments", icon: ClipboardCheck },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/clients", label: "Clients & Leads", icon: Users },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
  { href: "/admin/requests", label: "Requests", icon: MessageSquareText },
  { href: "/admin/issues", label: "Issues", icon: TriangleAlert },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/vendors", label: "Vendors", icon: Wrench },
] as const;

export function AdminSidebar({ account, onNavigate }: { account: StaffAccount; onNavigate?: () => void }) {
  const pathname = usePathname();

  return <div className="flex h-full flex-col bg-[#0c0f0e] text-white">
    <div className="border-b border-white/10 px-6 py-7">
      <Link href="/admin" onClick={onNavigate} className="block"><span className="block font-serif text-2xl tracking-[0.22em]">APRISM</span><span className="mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#c7a76b]">Operations</span></Link>
    </div>
    <nav aria-label="Admin navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return <Link key={href} href={href} onClick={onNavigate} className={`flex min-h-11 items-center gap-3 border-l-2 px-4 text-sm transition ${active ? "border-[#c7a76b] bg-white/[0.075] text-white" : "border-transparent text-white/55 hover:bg-white/[0.04] hover:text-white"}`}><Icon aria-hidden="true" className={`size-[18px] ${active ? "text-[#d2b573]" : "text-white/35"}`} /><span>{label}</span></Link>;
      })}
    </nav>
    <div className="border-t border-white/10 p-3">
      <Link href="/portal" onClick={onNavigate} className="flex min-h-10 items-center gap-3 px-4 text-xs text-white/48 transition hover:text-white"><Handshake aria-hidden="true" className="size-4" />Client Portal</Link>
      <Link href="/admin/settings" onClick={onNavigate} className="flex min-h-10 items-center gap-3 px-4 text-xs text-white/48 transition hover:text-white"><Settings aria-hidden="true" className="size-4" />Settings</Link>
      <div className="mt-3 border-t border-white/10 px-4 pt-4"><p className="truncate text-sm font-medium text-white/85">{account.displayName}</p><p className="mt-1 truncate text-[0.68rem] text-white/38">{account.email}</p><p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#c7a76b]">{account.role}</p></div>
      <form action={adminSignOut} className="mt-3"><button type="submit" className="flex min-h-10 w-full items-center gap-3 px-4 text-xs text-white/48 transition hover:bg-white/[0.04] hover:text-white"><LogOut aria-hidden="true" className="size-4" />Sign Out</button></form>
    </div>
  </div>;
}
