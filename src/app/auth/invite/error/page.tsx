import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert } from "lucide-react";

export const metadata: Metadata = { title: "Invitation Help", robots: { index: false, follow: false } };

export default async function InviteErrorPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return <main className="flex min-h-screen items-center justify-center bg-[#0b0d0d] px-5 py-16 text-white">
    <section className="w-full max-w-lg border border-white/10 bg-[#111514] p-7 sm:p-9">
      <div className="flex size-11 items-center justify-center border border-[#b7736b]/30 bg-[#b7736b]/10"><CircleAlert aria-hidden="true" className="size-5 text-[#d59b94]" /></div>
      <p className="mt-7 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#c7a76b]">Secure invitation</p>
      <h1 className="mt-4 font-serif text-5xl leading-none">This link can’t be completed.</h1>
      <p className="mt-5 text-sm leading-7 text-white/48">{message || "The invitation is invalid, expired, or no longer linked to an active APRISM client account."}</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/portal/login" className="inline-flex min-h-11 items-center bg-[#c7a76b] px-5 text-xs font-semibold text-[#111311]">Portal Sign In</Link><Link href="/contact" className="inline-flex min-h-11 items-center border border-white/15 px-5 text-xs font-semibold text-white/65">Contact APRISM</Link></div>
    </section>
  </main>;
}
