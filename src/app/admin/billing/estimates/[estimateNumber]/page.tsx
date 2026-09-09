import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileCheck2, Send } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";
import { formatBillingDate, formatMoney } from "@/lib/billing";
import { convertEstimateToInvoice, sendEstimateEmail } from "../actions";

export const metadata: Metadata = { title: "Estimate Admin" };
const messages: Record<string,string> = {
  sent: "Estimate email sent successfully.",
  failed: "Estimate email could not be sent.",
  "not-configured": "Estimate email is not configured in production.",
  "missing-recipient": "This client needs a billing email before the estimate can be sent.",
  "not-found": "Estimate not found.",
};

export default async function EstimateAdminPage({ params, searchParams }: { params: Promise<{ estimateNumber: string }>; searchParams: Promise<{ email?: string; convert?: string }> }) {
  const [{ estimateNumber }, query] = await Promise.all([params, searchParams]);
  const { supabase } = await requireStaff();
  const { data: estimate } = await supabase.from("estimates")
    .select("id,client_account_id,estimate_number,status,issue_date,valid_until,subtotal,tax,total,currency,notes,approved_at,declined_at,converted_invoice_id,client_accounts(display_name,billing_email,email)")
    .eq("estimate_number", estimateNumber).maybeSingle();
  if (!estimate) notFound();
  const { data: items } = await supabase.from("estimate_items").select("id,description,quantity,unit,unit_price,amount").eq("estimate_id", estimate.id).order("created_at");
  const relation = estimate.client_accounts as { display_name:string; billing_email:string|null; email:string|null } | { display_name:string; billing_email:string|null; email:string|null }[] | null;
  const account = Array.isArray(relation) ? relation[0] : relation;
  const recipient = account?.billing_email ?? account?.email ?? null;
  const emailMessage = query.email ? messages[query.email] : null;

  return <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <Link href="/admin/billing" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ArrowLeft className="size-4" />Billing</Link>
    <AdminPageHeader eyebrow="Estimate record" title={estimate.estimate_number} description={account?.display_name ?? "APRISM client"} actions={<div className="flex flex-wrap items-center gap-2">
      <form action={sendEstimateEmail}><input type="hidden" name="estimateNumber" value={estimate.estimate_number} /><button type="submit" disabled={!recipient || ["approved","declined","converted","expired"].includes(estimate.status)} className="inline-flex min-h-10 items-center gap-2 bg-[#171b19] px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"><Send className="size-4" />Send Estimate</button></form>
      <a href={`/estimate/${estimate.id}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 border border-black/15 bg-white px-3 text-xs font-semibold"><ExternalLink className="size-4" />Client review page</a>
      {estimate.status === "approved" ? <form action={convertEstimateToInvoice}><input type="hidden" name="estimateNumber" value={estimate.estimate_number} /><button type="submit" className="inline-flex min-h-10 items-center gap-2 bg-[#87682f] px-3 text-xs font-semibold text-white"><FileCheck2 className="size-4" />Convert to Invoice</button></form> : null}
      <StatusBadge value={estimate.status} />
    </div>} />

    {emailMessage ? <div className={`mt-5 border px-4 py-3 text-sm ${query.email === "sent" ? "border-emerald-700/20 bg-emerald-50 text-emerald-900" : "border-amber-700/20 bg-amber-50 text-amber-900"}`}>{emailMessage}</div> : null}
    {query.convert ? <div className="mt-5 border border-amber-700/20 bg-amber-50 px-4 py-3 text-sm text-amber-900">Estimate could not be converted: {query.convert}.</div> : null}

    <section className="mt-6 grid gap-4 sm:grid-cols-4">
      <Metric label="Issued" value={formatBillingDate(estimate.issue_date)} />
      <Metric label="Valid until" value={formatBillingDate(estimate.valid_until)} />
      <Metric label="Total" value={formatMoney(Number(estimate.total), estimate.currency)} />
      <Metric label="Status" value={estimate.status.replaceAll("_", " ")} />
    </section>

    <section className="mt-6 border border-black/10 bg-white">
      <div className="border-b border-black/10 px-5 py-4"><h2 className="font-serif text-2xl">Estimate line items</h2></div>
      {(items ?? []).length ? <div className="divide-y divide-black/10">{(items ?? []).map((item) => <div key={item.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto]"><div><p className="text-sm font-semibold">{item.description}</p><p className="mt-1 text-xs text-black/40">{item.quantity} {item.unit} × {formatMoney(Number(item.unit_price), estimate.currency)}</p></div><p className="font-semibold">{formatMoney(Number(item.amount), estimate.currency)}</p></div>)}</div> : <p className="px-5 py-8 text-sm text-black/45">No estimate items.</p>}
    </section>

    {estimate.notes ? <section className="mt-6 border border-black/10 bg-[#f8f6f0] p-5"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Notes</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/60">{estimate.notes}</p></section> : null}
  </main>;
}

function Metric({ label, value }: { label:string; value:string }) { return <div className="border border-black/10 bg-white p-4"><p className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-black/35">{label}</p><p className="mt-2 font-serif text-xl capitalize">{value}</p></div>; }
