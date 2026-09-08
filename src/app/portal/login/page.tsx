import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/portal/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Secure Sign In", description: "Secure APRISM client and operations sign in.", robots: { index: false, follow: false } };

export default async function PortalLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const requestedPath = (await searchParams).next ?? "/portal";
  const nextPath = /^\/(admin|portal)(\/|$)/.test(requestedPath) ? requestedPath : "/portal";
  const isAdmin = nextPath.startsWith("/admin");
  return <main className="grid min-h-screen bg-[#0b0d0d] text-white lg:grid-cols-[1.05fr_0.95fr]"><section className="portal-login-scene relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between"><Link href="/" className="relative z-10 text-lg font-semibold tracking-[0.32em]">APRISM</Link><div className="relative z-10 max-w-lg"><p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#c7a76b]">{isAdmin ? "Private Operations Console" : "Private Client Portal"}</p><h1 className="mt-6 font-serif text-6xl leading-[0.92]">{isAdmin ? "The business record, under your direction." : "The property record, always within reach."}</h1><p className="mt-6 text-sm leading-7 text-white/48">{isAdmin ? "Prospective clients, active properties, requests, issues, and stewardship work—held in one secure operating view." : "Inspections, maintenance, issues, documents, vendors, photographs, and service requests—held in one continuous record."}</p></div></section><section className="flex items-center justify-center px-5 py-20 sm:px-10"><div className="w-full max-w-md"><Link href="/" className="text-base font-semibold tracking-[0.3em] lg:hidden">APRISM</Link><p className="mt-14 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#c7a76b] lg:mt-0">Secure access</p><h2 className="mt-4 font-serif text-5xl">Welcome back.</h2><p className="mb-9 mt-4 text-sm leading-6 text-white/42">{isAdmin ? "Sign in with your APRISM owner account." : "Sign in to view the current operating record for your property."}</p><LoginForm previewEnabled={!isSupabaseConfigured} nextPath={nextPath} /><Link href="/contact" className="mt-9 inline-block text-xs text-white/34 transition hover:text-white">Need portal support? Contact APRISM.</Link></div></section></main>;
}
