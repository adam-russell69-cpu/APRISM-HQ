import type { Metadata } from "next";
import { ArrowLeft, CalendarDays, FileText, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BillingStatusBadge, DemoBillingNotice } from "@/components/portal/billing-ui";
import { Panel, PortalPageHeader } from "@/components/portal/portal-ui";
import { formatBillingDate, formatMoney, locationLabel } from "@/lib/billing";
import { getBusinessBillingSnapshot, getBusinessWorkOrder } from "@/lib/billing-records";

export const metadata: Metadata = { title: "Work Order" };

export default async function BusinessWorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [workOrder, snapshot] = await Promise.all([getBusinessWorkOrder(id), getBusinessBillingSnapshot()]);
  if (!workOrder) notFound();
  const invoice = snapshot.invoices.find((item) => item.workOrderId === workOrder.id);

  return <main className="mx-auto max-w-[1200px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
    <Link href="/portal/business/work-orders" className="mb-6 inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-black/48"><ArrowLeft aria-hidden="true" className="size-4" />All work orders</Link>
    <PortalPageHeader eyebrow={snapshot.account?.displayName ?? "Business account"} title={workOrder.title} description={workOrder.description ?? "Work scope coordinated by APRISM."} />
    {snapshot.mode === "preview" ? <DemoBillingNotice /> : null}
    <section className="mt-7 grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4"><div className="bg-[#f8f7f2] p-5"><p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-black/35">Status</p><div className="mt-4"><BillingStatusBadge status={workOrder.status} /></div></div><div className="bg-[#f8f7f2] p-5"><p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-black/35">Priority</p><p className="mt-4 font-serif text-2xl capitalize">{workOrder.priority}</p></div><div className="bg-[#f8f7f2] p-5"><p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-black/35">Scheduled</p><p className="mt-4 text-sm">{formatBillingDate(workOrder.scheduledAt)}</p></div><div className="bg-[#f8f7f2] p-5"><p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-black/35">Completed</p><p className="mt-4 text-sm">{formatBillingDate(workOrder.completedAt, "Not completed")}</p></div></section>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <Panel title="Service location" eyebrow="Assignment"><div className="p-6"><MapPin aria-hidden="true" className="size-5 text-[#8c6f3c]" /><p className="mt-5 font-serif text-3xl">{locationLabel(workOrder)}</p><p className="mt-2 text-sm text-black/43">{workOrder.locationDetail ?? "Location held in the private APRISM record."}</p>{workOrder.notes ? <p className="mt-6 border-t border-black/10 pt-5 text-sm leading-7 text-black/50">{workOrder.notes}</p> : null}</div></Panel>
      <Panel title="Timing" eyebrow="Service record"><div className="space-y-5 p-6"><div className="flex gap-3"><CalendarDays aria-hidden="true" className="mt-0.5 size-4 text-[#8c6f3c]" /><div><p className="text-[0.55rem] font-semibold uppercase tracking-[0.13em] text-black/35">Scheduled service</p><p className="mt-1 text-sm">{formatBillingDate(workOrder.scheduledAt)}</p></div></div><div className="flex gap-3"><CalendarDays aria-hidden="true" className="mt-0.5 size-4 text-[#8c6f3c]" /><div><p className="text-[0.55rem] font-semibold uppercase tracking-[0.13em] text-black/35">Completion</p><p className="mt-1 text-sm">{formatBillingDate(workOrder.completedAt, "Pending")}</p></div></div></div></Panel>
    </div>
    {invoice ? <Panel title="Invoice" eyebrow="Billing record" className="mt-5"><Link href={`/portal/invoices/${encodeURIComponent(invoice.invoiceNumber)}`} className="flex flex-col gap-5 p-6 transition hover:bg-black/[0.025] sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><FileText aria-hidden="true" className="mt-0.5 size-5 text-[#8c6f3c]" /><div><BillingStatusBadge status={invoice.status} /><p className="mt-3 text-sm font-semibold">{invoice.invoiceNumber}</p><p className="mt-1 text-xs text-black/40">Issued {formatBillingDate(invoice.issueDate)} · Due {formatBillingDate(invoice.dueDate)}</p></div></div><div className="sm:text-right"><p className="font-serif text-3xl">{formatMoney(invoice.amountDue, invoice.currency)}</p><p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-[#80632d]">View invoice</p></div></Link></Panel> : null}
  </main>;
}
