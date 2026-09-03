import type { Metadata } from "next";
import { ArrowRight, Download, ReceiptText } from "lucide-react";
import Link from "next/link";
import { BillingDataNotice, BillingEmptyState, BillingStatusBadge, DemoBillingNotice } from "@/components/portal/billing-ui";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { formatBillingDate, formatMoney } from "@/lib/billing";
import { getClientInvoices } from "@/lib/billing-records";

export const metadata: Metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const { mode, invoices, errorMessage } = await getClientInvoices();
  const outstanding = invoices.filter((invoice) => invoice.amountDue > 0 && !["draft", "void", "cancelled"].includes(invoice.status));
  const totalDue = outstanding.reduce((sum, invoice) => sum + invoice.amountDue, 0);

  return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
    <PortalPageHeader eyebrow="Account billing" title="Invoices" description="Invoice history, payment status, and secure Stripe-hosted payment access for every authorized client account." />
    {mode === "preview" ? <DemoBillingNotice /> : null}
    {errorMessage ? <BillingDataNotice message={errorMessage} /> : null}
    <section className="mt-7 grid overflow-hidden border border-black/10 bg-[#171b19] text-white sm:grid-cols-3"><div className="p-6 sm:p-8"><p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/35">Outstanding invoices</p><p className="mt-5 font-serif text-4xl">{outstanding.length}</p></div><div className="border-white/10 p-6 sm:border-l sm:p-8"><p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/35">Amount currently due</p><p className="mt-5 font-serif text-4xl text-[#d2b573]">{formatMoney(totalDue)}</p></div><div className="border-white/10 p-6 sm:border-l sm:p-8"><p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/35">Payment handling</p><p className="mt-5 text-sm leading-6 text-white/60">ACH preferred<br /><span className="text-white/35">Cards also accepted</span></p></div></section>
    <section className="mt-5 overflow-hidden border border-black/10 bg-[#f8f7f2]">
      {invoices.length ? <div className="divide-y divide-black/10">{invoices.map((invoice) => { const payable = invoice.amountDue > 0 && ["sent", "partially_paid", "overdue"].includes(invoice.status); return <article key={invoice.id} className="grid gap-5 px-5 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.75fr)_minmax(0,0.7fr)_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><BillingStatusBadge status={invoice.status} /><span className="text-[0.58rem] uppercase tracking-[0.12em] text-black/35">{invoice.accountType} account</span></div><h2 className="mt-3 font-serif text-2xl">{invoice.invoiceNumber}</h2><p className="mt-1 text-xs text-black/42">{invoice.clientName}{invoice.serviceLocation ? ` · ${invoice.serviceLocation}` : ""}</p></div><div><p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-black/34">Dates</p><p className="mt-2 text-sm">Issued {formatBillingDate(invoice.issueDate)}</p><p className="mt-1 text-xs text-black/40">Due {formatBillingDate(invoice.dueDate)}</p></div><div><p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-black/34">Balance due</p><p className="mt-2 font-serif text-2xl">{formatMoney(invoice.amountDue, invoice.currency)}</p><p className="mt-1 text-xs text-black/40">Total {formatMoney(invoice.total, invoice.currency)}</p></div><div className="flex flex-wrap gap-2 lg:justify-end">{invoice.pdfStoragePath ? <Link href={`/portal/invoices/${encodeURIComponent(invoice.invoiceNumber)}/pdf`} className="inline-flex min-h-10 items-center gap-2 border border-black/12 px-3 text-[0.56rem] font-semibold uppercase tracking-[0.12em]"><Download aria-hidden="true" className="size-3.5" />PDF</Link> : null}<Link href={`/portal/invoices/${encodeURIComponent(invoice.invoiceNumber)}`} className={`inline-flex min-h-10 items-center gap-2 px-4 text-[0.56rem] font-semibold uppercase tracking-[0.12em] ${payable ? "bg-[#171a19] text-white" : "border border-black/12"}`}>{payable ? "Pay now" : "View invoice"}<ArrowRight aria-hidden="true" className="size-3.5" /></Link></div></article>; })}</div> : <BillingEmptyState title="No invoices" description="Invoices for your authorized client accounts will appear here." />}
    </section>
    <div className="mt-5 flex items-start gap-3 border border-black/10 bg-[#f8f7f2] p-5 text-xs leading-6 text-black/45"><ReceiptText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#8c6f3c]" /><p>APRISM never collects card or bank credentials in this portal. Payment details are entered only in Stripe-hosted Checkout.</p></div>
  </main>;
}
