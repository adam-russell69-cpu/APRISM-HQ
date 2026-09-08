import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClientAccount } from "../actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/lib/admin-account";

export const metadata: Metadata = { title: "New Client" };
const inputClass = "mt-2 min-h-11 w-full border border-black/15 bg-white px-3.5 text-sm outline-none focus:border-[#8f713d]";

export default async function NewClientPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireStaff();
  const { error } = await searchParams;

  return <main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <Link href="/admin/clients?view=clients" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ChevronLeft aria-hidden="true" className="size-4" />All clients</Link>
    <AdminPageHeader eyebrow="Relationship onboarding" title="New Client" description="Create the client account first. Portal access is added separately from the client detail record using an existing Supabase Auth user ID." />
    {error ? <p role="alert" className="mt-5 border border-[#83524d]/30 bg-[#83524d]/10 px-4 py-3 text-sm text-[#71413d]">{error}</p> : null}
    <form action={createClientAccount} className="mt-6 space-y-5 border border-black/10 bg-[#f8f6f0] p-5 sm:p-7">
      <section><h2 className="font-serif text-2xl">Account identity</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-black/55">Account type<select name="account_type" defaultValue="business" className={inputClass}><option value="private">Private</option><option value="business">Business</option></select></label>
        <label className="text-xs font-semibold text-black/55">Status<select name="status" defaultValue="active" className={inputClass}><option value="prospect">Prospect</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        <label className="text-xs font-semibold text-black/55">Display name<input name="display_name" required maxLength={160} autoComplete="organization" className={inputClass} /></label>
        <label className="text-xs font-semibold text-black/55">Legal name<input name="legal_name" maxLength={200} autoComplete="organization" className={inputClass} /></label>
      </div></section>
      <section className="border-t border-black/10 pt-5"><h2 className="font-serif text-2xl">Contact & billing</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-black/55">Primary email<input name="email" type="email" maxLength={254} autoComplete="email" className={inputClass} /></label>
        <label className="text-xs font-semibold text-black/55">Phone<input name="phone" type="tel" maxLength={40} autoComplete="tel" className={inputClass} /></label>
        <label className="text-xs font-semibold text-black/55">Billing email<input name="billing_email" type="email" maxLength={254} className={inputClass} /></label>
        <label className="text-xs font-semibold text-black/55">Payment terms days<input name="payment_terms_days" type="number" required min={0} max={365} step={1} defaultValue={15} className={inputClass} /></label>
      </div></section>
      <div className="flex justify-end border-t border-black/10 pt-5"><button type="submit" className="min-h-12 bg-[#171a19] px-6 text-xs font-semibold text-white">Create Client</button></div>
    </form>
  </main>;
}
