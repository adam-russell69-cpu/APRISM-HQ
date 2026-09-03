import type { Metadata } from "next";
import { ArrowRight, BriefcaseBusiness, MapPin } from "lucide-react";
import Link from "next/link";
import { BillingDataNotice, BillingEmptyState, BillingStatusBadge, DemoBillingNotice } from "@/components/portal/billing-ui";
import { Metric, Panel, PortalPageHeader } from "@/components/portal/portal-ui";
import { formatBillingDate, formatMoney, locationLabel } from "@/lib/billing";
import { getBusinessBillingSnapshot } from "@/lib/billing-records";

export const metadata: Metadata = { title: "Business Account" };

export default async function BusinessPortalPage() {
  const snapshot = await getBusinessBillingSnapshot();
  const { account } = snapshot;
  if (!account) {
    return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10"><PortalPageHeader eyebrow="Business client portal" title="Business account" description="Company locations, work orders, and billing are held in one secure operating record." />{snapshot.errorMessage ? <BillingDataNotice message={snapshot.errorMessage} /> : null}<Panel title="Account access" eyebrow="Client account" className="mt-7"><BillingEmptyState title="No business account is linked" description="Your private property portal remains available. APRISM can provision business access through an explicit client-account membership." /></Panel></main>;
  }

  const openWorkOrders = snapshot.workOrders.filter((workOrder) => !["completed", "cancelled", "invoiced"].includes(workOrder.status));
  const outstandingInvoices = snapshot.invoices.filter((invoice) => invoice.amountDue > 0 && !["draft", "void", "cancelled"].includes(invoice.status));
  const amountDue = outstandingInvoices.reduce((total, invoice) => total + invoice.amountDue, 0);
  const completedWork = snapshot.workOrders.filter((workOrder) => workOrder.completedAt).slice(0, 3);

  return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
    <PortalPageHeader eyebrow="Business client portal" title={account.displayName} description="A consolidated view of active locations, coordinated work, and account billing." action={<Link href="/portal/business/work-orders" className="inline-flex min-h-11 items-center gap-2 bg-[#171a19] px-5 text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-white">All work orders <ArrowRight aria-hidden="true" className="size-4" /></Link>} />
    {snapshot.mode === "preview" ? <DemoBillingNotice /> : null}
    {snapshot.errorMessage ? <BillingDataNotice message={snapshot.errorMessage} /> : null}
    <section className="mt-7 grid overflow-hidden border border-black/10 bg-[#171b19] text-white lg:grid-cols-[1.25fr_0.75fr]">
      <div className="p-7 sm:p-10"><p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#d1b477]">Account</p><BriefcaseBusiness aria-hidden="true" className="mt-10 size-5 text-white/40" /><h2 className="mt-5 font-serif text-4xl sm:text-5xl">{account.displayName}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/45">{account.legalName ?? account.displayName} · Net {account.paymentTermsDays} account · {snapshot.locations.filter((location) => location.active).length} active service locations</p></div>
      <div className="grid grid-cols-2 gap-px bg-white/10"><div className="bg-[#202421] p-6"><p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/35">Open work</p><p className="mt-5 font-serif text-4xl">{openWorkOrders.length}</p></div><div className="bg-[#202421] p-6"><p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/35">Current balance</p><p className="mt-5 font-serif text-3xl text-[#d1b477]">{formatMoney(amountDue)}</p></div><Link href="/portal/invoices" className="col-span-2 flex items-center justify-between bg-[#272c29] p-6 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#d7ba82]">Open billing record <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
    </section>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Open work orders" value={openWorkOrders.length} detail="Requested through in progress" /><Metric label="Active locations" value={snapshot.locations.filter((location) => location.active).length} detail="Managed service locations" /><Metric label="Outstanding invoices" value={outstandingInvoices.length} detail="Sent, partial, or overdue" /><Metric label="Amount currently due" value={formatMoney(amountDue)} detail={`Account terms · Net ${account.paymentTermsDays}`} /></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <Panel title="Work orders" eyebrow="Current coordination" action={<Link href="/portal/business/work-orders" className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-[#80632d]">View all</Link>}>
        {snapshot.workOrders.length ? <div className="divide-y divide-black/10">{snapshot.workOrders.slice(0, 4).map((workOrder) => <Link key={workOrder.id} href={`/portal/business/work-orders/${workOrder.id}`} className="grid gap-4 px-5 py-5 transition hover:bg-black/[0.025] sm:grid-cols-[1fr_auto] sm:px-6"><div><div className="flex flex-wrap items-center gap-2"><BillingStatusBadge status={workOrder.status} /><span className="text-[0.62rem] uppercase tracking-[0.12em] text-black/35">{workOrder.priority}</span></div><h3 className="mt-3 text-sm font-semibold">{workOrder.title}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-black/42"><MapPin aria-hidden="true" className="size-3.5" />{locationLabel(workOrder)}</p></div><ArrowRight aria-hidden="true" className="mt-2 size-4 text-black/28" /></Link>)}</div> : <BillingEmptyState title="No work orders" description="Requested and scheduled business work will appear here." />}
      </Panel>
      <Panel title="Billing" eyebrow="Open invoices" action={<Link href="/portal/invoices" className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-[#80632d]">All invoices</Link>}>
        {outstandingInvoices.length ? <div className="divide-y divide-black/10">{outstandingInvoices.slice(0, 4).map((invoice) => <Link key={invoice.id} href={`/portal/invoices/${encodeURIComponent(invoice.invoiceNumber)}`} className="flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-black/[0.025] sm:px-6"><div><BillingStatusBadge status={invoice.status} /><p className="mt-3 text-sm font-semibold">{invoice.invoiceNumber}</p><p className="mt-1 text-xs text-black/40">Due {formatBillingDate(invoice.dueDate)}</p></div><p className="font-serif text-2xl">{formatMoney(invoice.amountDue, invoice.currency)}</p></Link>)}</div> : <BillingEmptyState title="No balance due" description="Sent invoices and payment status will appear here." />}
      </Panel>
    </div>
    <Panel title="Recently completed work" eyebrow="Service record" className="mt-5">{completedWork.length ? <div className="grid gap-px bg-black/10 md:grid-cols-3">{completedWork.map((workOrder) => <article key={workOrder.id} className="bg-[#f8f7f2] p-5"><BillingStatusBadge status={workOrder.status} /><h3 className="mt-4 text-sm font-semibold">{workOrder.title}</h3><p className="mt-2 text-xs text-black/42">{locationLabel(workOrder)} · {formatBillingDate(workOrder.completedAt)}</p></article>)}</div> : <BillingEmptyState title="No completed work yet" description="Completed service history will remain available here." />}</Panel>
  </main>;
}
