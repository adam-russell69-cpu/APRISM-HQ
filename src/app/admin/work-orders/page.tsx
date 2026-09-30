import Link from "next/link";
import { Clock3, MapPin, Wrench } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Denver" });

export default async function WorkOrdersPage() {
  const { supabase } = await requireStaff();
  const { data: workOrders } = await supabase
    .from("work_orders")
    .select("id, property_id, title, status, priority, scheduled_at, created_at, source")
    .order("created_at", { ascending: false })
    .limit(100);

  const propertyIds = [...new Set((workOrders ?? []).map((row) => row.property_id).filter(Boolean))] as string[];
  const { data: properties } = propertyIds.length
    ? await supabase.from("properties").select("id, name, address_line_1, city, state").in("id", propertyIds)
    : { data: [] as { id: string; name: string; address_line_1: string; city: string; state: string }[] };
  const propertyMap = new Map((properties ?? []).map((property) => [property.id, property]));

  return <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <AdminPageHeader eyebrow="V1-A field operations" title="Work orders" description="The live APRISM queue for manager, homeowner, and resident service work." />
    <div className="mt-6 grid gap-4">
      {(workOrders ?? []).length ? (workOrders ?? []).map((workOrder) => {
        const property = workOrder.property_id ? propertyMap.get(workOrder.property_id) : null;
        return <Link key={workOrder.id} href={`/admin/work-orders/${workOrder.id}`} className="group border border-black/10 bg-white p-5 transition hover:border-[#9a7840]/50 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0"><div className="flex items-center gap-2"><Wrench aria-hidden="true" className="size-4 text-[#8a6a32]" /><p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-black/40">{String(workOrder.source).replaceAll("_", " ")} · {workOrder.priority}</p></div><h2 className="mt-2 font-serif text-2xl text-[#1c211f] group-hover:text-[#755a2e]">{workOrder.title}</h2>{property ? <p className="mt-2 flex items-center gap-2 text-sm text-black/48"><MapPin aria-hidden="true" className="size-4" />{property.name} · {property.address_line_1}, {property.city}, {property.state}</p> : null}</div>
            <StatusBadge value={workOrder.status} />
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-black/8 pt-4 text-xs text-black/42"><span className="inline-flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4" />Created {dateFormatter.format(new Date(workOrder.created_at))}</span>{workOrder.scheduled_at ? <span>Scheduled {dateFormatter.format(new Date(workOrder.scheduled_at))}</span> : <span>Not yet scheduled</span>}</div>
        </Link>;
      }) : <section className="border border-dashed border-black/15 bg-white p-8 text-center"><p className="font-serif text-2xl">No work orders yet</p><p className="mt-2 text-sm text-black/45">Convert a service request into a work order to start the V1-A field workflow.</p></section>}
    </div>
  </main>;
}
