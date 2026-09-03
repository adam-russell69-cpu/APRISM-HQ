import type { Metadata } from "next";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { BillingDataNotice, BillingEmptyState, BillingStatusBadge, DemoBillingNotice } from "@/components/portal/billing-ui";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { formatBillingDate, locationLabel } from "@/lib/billing";
import { getBusinessBillingSnapshot } from "@/lib/billing-records";

export const metadata: Metadata = { title: "Business Work Orders" };

export default async function BusinessWorkOrdersPage() {
  const snapshot = await getBusinessBillingSnapshot();
  return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
    <PortalPageHeader eyebrow={snapshot.account?.displayName ?? "Business account"} title="Work orders" description="Requested work, scheduled service, and completed stewardship across every business location." />
    {snapshot.mode === "preview" ? <DemoBillingNotice /> : null}
    {snapshot.errorMessage ? <BillingDataNotice message={snapshot.errorMessage} /> : null}
    <section className="mt-7 overflow-hidden border border-black/10 bg-[#f8f7f2]">
      {snapshot.workOrders.length ? <div className="divide-y divide-black/10">{snapshot.workOrders.map((workOrder) => <Link key={workOrder.id} href={`/portal/business/work-orders/${workOrder.id}`} className="grid gap-5 px-5 py-6 transition hover:bg-black/[0.025] sm:px-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><BillingStatusBadge status={workOrder.status} /><span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-black/35">{workOrder.priority} priority</span></div><h2 className="mt-3 font-serif text-2xl">{workOrder.title}</h2><p className="mt-2 line-clamp-2 text-xs leading-5 text-black/43">{workOrder.description ?? "Scope coordinated directly with APRISM."}</p></div><div><p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-black/34">Property / location</p><p className="mt-2 flex items-start gap-1.5 text-sm"><MapPin aria-hidden="true" className="mt-0.5 size-4 text-[#8c6f3c]" />{locationLabel(workOrder)}</p>{workOrder.locationDetail ? <p className="ml-5 mt-1 text-xs text-black/40">{workOrder.locationDetail}</p> : null}</div><div><p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-black/34">Schedule</p><p className="mt-2 text-sm">{formatBillingDate(workOrder.scheduledAt)}</p><p className="mt-1 text-xs text-black/40">Completed {formatBillingDate(workOrder.completedAt, "—")}</p></div><ArrowRight aria-hidden="true" className="size-4 text-black/30" /></Link>)}</div> : <BillingEmptyState title="No business work orders" description="Work orders will appear after APRISM receives or schedules a request for this account." />}
    </section>
  </main>;
}
