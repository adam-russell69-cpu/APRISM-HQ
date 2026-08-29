import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { requireStaff } from "@/lib/admin-account";
import { adminSignOut } from "./actions";

export const metadata: Metadata = {
  title: "APRISM Admin",
  description: "Private APRISM operations console.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { account } = await requireStaff();
  const roleLabel = account.role === "owner" ? "Owner access" : `${account.role.charAt(0).toUpperCase()}${account.role.slice(1)} access`;

  return <div className="min-h-screen bg-[#eeece6] text-[#171a19]">
    <header className="border-b border-white/10 bg-[#0d100f] text-white">
      <div className="mx-auto flex min-h-20 max-w-[1560px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-6"><Link href="/admin" className="text-base font-semibold tracking-[0.3em]">APRISM</Link><span className="hidden border-l border-white/15 pl-6 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#c7a76b] sm:block">Operations Console</span></div>
        <nav aria-label="Admin navigation" className="flex items-center gap-3 sm:gap-5">
          <Link href="/portal" className="inline-flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/52 transition hover:text-white">Client view <ArrowUpRight aria-hidden="true" className="size-3.5" /></Link>
          <form action={adminSignOut}><button type="submit" className="inline-flex min-h-10 items-center gap-2 border border-white/15 px-3 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/65 transition hover:border-white/35 hover:text-white sm:px-4"><LogOut aria-hidden="true" className="size-3.5" /><span className="hidden sm:inline">Sign out</span></button></form>
        </nav>
      </div>
    </header>
    <div className="border-b border-black/10 bg-[#f7f5ef]"><div className="mx-auto flex max-w-[1560px] items-center justify-between px-5 py-3 sm:px-8 lg:px-10"><p className="text-xs text-black/48">Signed in as {account.displayName}</p><p className="text-[0.54rem] font-semibold uppercase tracking-[0.16em] text-[#80632d]">{roleLabel}</p></div></div>
    {children}
  </div>;
}
