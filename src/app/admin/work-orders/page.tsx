import Link from "next/link";
import { Clock3, MapPin, Wrench } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

const views = [
  { key: "open", label: "Open", statuses: ["requested", "approved", "scheduled"] },
  { key: "active", label: "Active", statuses: ["in_progress"] },
  { key: "waiting", label: "Waiting", statuses: ["waiting_parts", "awaiting_approval"] },
  { key: "complete", label: "Complete", statuses: ["completed", "invoiced", "paid"] },
] as const;

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Denver" });

export default async function WorkOrdersPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const activeView = views.find((item) => item.key === view) ?? views[0];
  const { supabase } = await requireStaff();

  const { data: workOrders, error } = await supabase
    .from("work_orders")
    .select("id, title, description, status, priority, source, scheduled_at, created_at, properties(name, address_line_1, city, state), client_accounts(display_name)")
    .order("created_at", { ascending: false });

  const records = (workOrders ?? []).filter((record) => (activeView.statuses as readonly string[]).includes(record.status));

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <AdminPageHeader eyebrow="Field operations" title="Work Orders" description="One queue for property-manager and homeowner requests, field visits, return trips, and completed work." />
    {error ? <div className="mt-5 border border-red-900/15 bg-red-50 p-4 text-sm text-red-900/70">APRISM could not load the work queue.</div> : null}
    <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-black/10" aria-label="Work order status">
      {views.map((item) => <Link key={item.key} href={`/admin/work-orders?view=${item.key}`} className={`min-h-11 shrink-0 border-b-2 px-4 py-3 text-sm font-semibold ${item.key === activeView.key ? "border-[#9a793e] text-black" : "border-transparent text-black/40 hover:text-black"}`}>{item.label}</Link>)}
    </nav>
    <section className="mt-5 grid gap-3">
      {records.length ? records.map((workOrder) => {
        const propertyRelation = Array.isArray(workOrder.properties) ? workOrder.properties[0] : workOrder.properties;
        const accountRelation = Array.isArray(workOrder.client_accounts) ? workOrder.client_accounts[0] : workOrder.client_accounts;
        const location = propertyRelation ? [propertyRelation.address_line_1, propertyRelation.city, propertyRelation.state].filter(Boolean).join(", ") : "Property not linked";
        return <Link key={workOrder.id} href={`/admin/work-orders/${workOrder.id}`} className="block border border-black/10 bg-white p-5 transition hover:border-black/20 hover:shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><StatusBadge value={workOrder.status} /><span className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-black/35">{workOrder.priority} · {workOrder.source.replaceAll("_", " ")}</span></div>
              <h2 className="mt-3 font-serif text-2xl leading-tight">{workOrder.title}</h2>
              <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-black/48">{workOrder.description || "No additional details recorded."}</p>
            </div>
            <div className="grid shrink-0 gap-2 text-xs text-black/50 sm:min-w-72">
              <p className="flex items-start gap-2"><MapPin aria-hidden="true" className="mt-0.5 size-4 text-[#9a793e]" /><span><strong className="block font-semibold text-black/65">{accountRelation?.display_name ?? propertyRelation?.name ?? "APRISM client"}</strong>{location}</span></p>
              <p className="flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4 text-black/30" />{workOrder.scheduled_at ? `Scheduled ${dateFormatter.format(new Date(workOrder.scheduled_at))}` : `Opened ${dateFormatter.format(new Date(workOrder.created_at))}`}</p>
            </div>
          </div>
        </Link>;
      }) : <div className="border border-black/10 bg-white"><EmptyState icon={Wrench} title={`No ${activeView.label.toLowerCase()} work orders`} description="Requests will enter this queue automatically as they are submitted through APRISM HQ." /></div>}
    </section>
  </main>;
}
