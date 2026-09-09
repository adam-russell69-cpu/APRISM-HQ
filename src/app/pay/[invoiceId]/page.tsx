import type { Metadata } from "next";
import { CheckCircle2, CreditCard, Landmark, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBillingDate, formatMoney } from "@/lib/billing";
import { createPublicInvoiceCheckout } from "./actions";

export const metadata: Metadata = { title: "Pay APRISM Invoice", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const paymentMessages: Record<string, string> = {
  processing: "Stripe received your payment. Bank payments may remain pending while they clear.",
  cancelled: "Payment was cancelled. No charge was completed.",
  unavailable: "Secure payment processing is temporarily unavailable. Please contact APRISM.",
  invalid: "This payment request is invalid.",
  "not-payable": "This invoice does not currently have a payable balance.",
  "ach-unavailable": "ACH is available only for USD invoices.",
};

export default async function PublicInvoicePaymentPage({ params, searchParams }: {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const [{ invoiceId }, query] = await Promise.all([params, searchParams]);
  if (!uuidPattern.test(invoiceId)) notFound();
  const admin = createAdminClient();
  if (!admin) notFound();

  const { data: invoice } = await admin.from("invoices")
    .select("id, invoice_number, status, issue_date, due_date, total, amount_paid, amount_due, currency, client_accounts(display_name)")
    .eq("id", invoiceId)
    .maybeSingle();
  if (!invoice) notFound();

  const relation = invoice.client_accounts as { display_name: string } | { display_name: string }[] | null;
  const clientName = Array.isArray(relation) ? relation[0]?.display_name : relation?.display_name;
  const payable = Number(invoice.amount_due) > 0 && ["sent", "partially_paid", "overdue"].includes(invoice.status);
  const paymentMessage = query.payment ? paymentMessages[query.payment] : null;

  return <main className="min-h-screen bg-[#efede7] px-4 py-10 text-[#171a19] sm:px-6">
    <div className="mx-auto max-w-2xl">
      <header className="bg-[#151918] px-6 py-8 text-white sm:px-9">
        <p className="text-lg font-semibold tracking-[0.32em]">APRISM</p>
        <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#d1b477]">Secure invoice payment</p>
        <h1 className="mt-7 font-serif text-4xl">{invoice.invoice_number}</h1>
        <p className="mt-3 text-sm text-white/55">{clientName ?? "APRISM client"}</p>
      </header>

      {paymentMessage ? <div className="border-x border-b border-[#8c6f3c]/20 bg-[#f7f1e3] px-6 py-4 text-sm leading-6 text-[#6f562c]">{paymentMessage}</div> : null}

      <section className="border-x border-b border-black/10 bg-white p-6 sm:p-9">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Invoice date" value={formatBillingDate(invoice.issue_date)} />
          <Metric label="Due date" value={formatBillingDate(invoice.due_date)} />
          <Metric label="Total" value={formatMoney(Number(invoice.total), invoice.currency)} />
        </div>

        <div className="mt-8 border-t border-black/10 pt-7">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-black/40">Balance due</p>
          <p className="mt-2 font-serif text-4xl text-[#80632d]">{formatMoney(Number(invoice.amount_due), invoice.currency)}</p>
          {Number(invoice.amount_paid) > 0 ? <p className="mt-2 text-xs text-black/45">Payments received: {formatMoney(Number(invoice.amount_paid), invoice.currency)}</p> : null}
        </div>

        {payable ? <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <form action={createPublicInvoiceCheckout}>
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <input type="hidden" name="paymentMethod" value="ach" />
            <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#d1b477] px-5 text-xs font-semibold uppercase tracking-[0.1em] text-[#171a19] hover:bg-[#dfc78f]"><Landmark className="size-4" />ACH / Bank Account</button>
          </form>
          <form action={createPublicInvoiceCheckout}>
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <input type="hidden" name="paymentMethod" value="card" />
            <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-black/15 px-5 text-xs font-semibold uppercase tracking-[0.1em] hover:border-black/35"><CreditCard className="size-4" />Credit / Debit Card</button>
          </form>
        </div> : <div className="mt-8 flex items-center gap-2 border border-black/10 bg-[#f7f5ef] p-4 text-sm"><CheckCircle2 className="size-5 text-[#80632d]" />This invoice has no payable balance.</div>}

        <div className="mt-7 flex items-start gap-2 border-t border-black/10 pt-5 text-xs leading-5 text-black/45"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#80632d]" />Payments are processed securely by Stripe. APRISM never receives or stores your bank or card credentials.</div>
      </section>
    </div>
  </main>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-black/35">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>;
}
