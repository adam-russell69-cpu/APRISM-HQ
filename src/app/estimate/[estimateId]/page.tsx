import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBillingDate, formatMoney } from "@/lib/billing";
import { approveEstimate, declineEstimate } from "./actions";

export const metadata: Metadata = { title: "Review APRISM Estimate", robots: { index: false, follow: false } };

export default async function PublicEstimatePage({ params, searchParams }: { params: Promise<{ estimateId: string }>; searchParams: Promise<{ response?: string }> }) {
  const [{ estimateId }, query] = await Promise.all([params, searchParams]);
  const admin = createAdminClient();
  if (!admin) notFound();
  const { data: estimate } = await admin.from("estimates")
    .select("id,estimate_number,status,issue_date,valid_until,total,currency,notes,client_accounts(display_name)")
    .eq("id", estimateId).maybeSingle();
  if (!estimate) notFound();
  const { data: items } = await admin.from("estimate_items").select("id,description,quantity,unit,unit_price,amount").eq("estimate_id", estimate.id).order("created_at");
  const relation = estimate.client_accounts as { display_name:string } | { display_name:string }[] | null;
  const account = Array.isArray(relation) ? relation[0] : relation;
  const canRespond = ["draft","sent"].includes(estimate.status) && estimate.valid_until >= new Date().toISOString().slice(0,10);
  const statusMessage = query.response ?? estimate.status;

  return <main className="min-h-screen bg-[#efede7] px-4 py-10 text-[#171a19] sm:px-6">
    <div className="mx-auto max-w-2xl">
      <header className="bg-[#151918] px-6 py-8 text-white sm:px-9">
        <p className="text-lg font-semibold tracking-[0.32em]">APRISM</p>
        <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#d1b477]">Estimate for review</p>
        <h1 className="mt-7 font-serif text-4xl">{estimate.estimate_number}</h1>
        <p className="mt-3 text-sm text-white/55">{account?.display_name ?? "APRISM client"}</p>
      </header>
      <section className="border-x border-b border-black/10 bg-white p-6 sm:p-9">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Issued" value={formatBillingDate(estimate.issue_date)} />
          <Metric label="Valid until" value={formatBillingDate(estimate.valid_until)} />
          <Metric label="Estimate total" value={formatMoney(Number(estimate.total), estimate.currency)} />
        </div>

        <div className="mt-8 border-t border-black/10 pt-7">
          <h2 className="font-serif text-2xl">Scope</h2>
          <div className="mt-4 divide-y divide-black/10 border-y border-black/10">{(items ?? []).map((item) => <div key={item.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto]"><div><p className="text-sm font-semibold">{item.description}</p><p className="mt-1 text-xs text-black/40">{item.quantity} {item.unit} × {formatMoney(Number(item.unit_price), estimate.currency)}</p></div><p className="font-semibold">{formatMoney(Number(item.amount), estimate.currency)}</p></div>)}</div>
        </div>

        {estimate.notes ? <div className="mt-7 border border-black/10 bg-[#f8f6f0] p-4"><p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Notes</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/60">{estimate.notes}</p></div> : null}

        {statusMessage === "approved" || estimate.status === "approved" ? <div className="mt-7 flex items-start gap-3 border border-emerald-700/20 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 className="mt-0.5 size-5 shrink-0" /><div><p className="font-semibold">Estimate approved</p><p className="mt-1 text-emerald-900/70">APRISM has received your approval.</p></div></div> : null}
        {statusMessage === "declined" || estimate.status === "declined" ? <div className="mt-7 flex items-start gap-3 border border-amber-700/20 bg-amber-50 p-4 text-sm text-amber-900"><XCircle className="mt-0.5 size-5 shrink-0" /><div><p className="font-semibold">Estimate declined</p><p className="mt-1 text-amber-900/70">APRISM has received your response.</p></div></div> : null}
        {estimate.status === "expired" || estimate.valid_until < new Date().toISOString().slice(0,10) ? <div className="mt-7 border border-black/10 bg-[#f8f6f0] p-4 text-sm text-black/60">This estimate has expired. Contact APRISM for an updated estimate.</div> : null}

        {canRespond ? <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <form action={approveEstimate}><input type="hidden" name="estimateId" value={estimate.id} /><button type="submit" className="min-h-12 w-full bg-[#d1b477] px-5 text-xs font-semibold uppercase tracking-[0.1em] text-[#171a19]">Approve Estimate</button></form>
          <form action={declineEstimate}><input type="hidden" name="estimateId" value={estimate.id} /><button type="submit" className="min-h-12 w-full border border-black/15 px-5 text-xs font-semibold uppercase tracking-[0.1em]">Decline</button></form>
        </div> : null}
        <p className="mt-7 border-t border-black/10 pt-5 text-xs leading-5 text-black/45">Approval authorizes APRISM to proceed with the scope and pricing shown above. Any material change to scope should be approved separately.</p>
      </section>
    </div>
  </main>;
}

function Metric({ label, value }: { label:string; value:string }) { return <div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-black/35">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>; }
