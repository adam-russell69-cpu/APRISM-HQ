import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/lib/admin-account";
import { createEstimate } from "../actions";

export const metadata: Metadata = { title: "New Estimate" };
const inputClass = "mt-2 min-h-11 w-full border border-black/15 bg-white px-3.5 text-sm outline-none focus:border-[#8f713d]";

export default async function NewEstimatePage({ searchParams }: { searchParams: Promise<{ client?: string; error?: string }> }) {
  const query = await searchParams;
  const { supabase } = await requireStaff();
  const { data: accounts } = await supabase.from("client_accounts").select("id,display_name,status").in("status", ["active", "prospect"]).order("display_name");
  const today = new Date();
  const issueDate = today.toISOString().slice(0, 10);
  const valid = new Date(today);
  valid.setDate(valid.getDate() + 30);
  const validUntil = valid.toISOString().slice(0, 10);

  return <main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <Link href="/admin/billing" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ArrowLeft className="size-4" />Billing</Link>
    <AdminPageHeader eyebrow="Client estimate" title="New Estimate" description="Build a quote, send it for approval, then convert an approved estimate into a draft invoice." />
    {query.error ? <div role="alert" className="mt-5 border border-amber-700/20 bg-amber-50 px-4 py-3 text-sm text-amber-900">{query.error}</div> : null}

    <form action={createEstimate} className="mt-6 border border-black/10 bg-[#f8f6f0] p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-black/55 sm:col-span-2">Client
          <select name="client_account_id" required defaultValue={query.client ?? ""} className={inputClass}>
            <option value="" disabled>Select client</option>
            {(accounts ?? []).map((account) => <option key={account.id} value={account.id}>{account.display_name}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-black/55">Issue date<input name="issue_date" type="date" required defaultValue={issueDate} className={inputClass} /></label>
        <label className="text-xs font-semibold text-black/55">Valid until<input name="valid_until" type="date" required defaultValue={validUntil} className={inputClass} /></label>
      </div>

      <div className="mt-7 border-t border-black/10 pt-6">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Labor / service</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_0.25fr_0.3fr]">
          <label className="text-xs font-semibold text-black/55">Description<input name="labor_description" required maxLength={1000} placeholder="Window well covers and screen door work" className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Hours<input name="labor_qty" type="number" min="0.001" step="0.25" defaultValue="1" required className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Rate<input name="labor_rate" type="number" min="0" step="0.01" defaultValue="55" required className={inputClass} /></label>
        </div>
      </div>

      <div className="mt-7 border-t border-black/10 pt-6">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Materials</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_0.35fr]">
          <label className="text-xs font-semibold text-black/55">Description<input name="materials_description" maxLength={1000} placeholder="Window well covers, screen materials, hardware" className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Amount<input name="materials_amount" type="number" min="0" step="0.01" defaultValue="0" required className={inputClass} /></label>
        </div>
      </div>

      <label className="mt-7 block text-xs font-semibold text-black/55">Notes<textarea name="notes" maxLength={2000} rows={5} placeholder="Scope assumptions, exclusions, lead times, or client notes." className={`${inputClass} py-3`} /></label>
      <div className="mt-7 flex justify-end border-t border-black/10 pt-5"><button type="submit" className="min-h-11 bg-[#171a19] px-6 text-xs font-semibold text-white">Create Draft Estimate</button></div>
    </form>
  </main>;
}
