import { CalendarDays } from "lucide-react";
import { EmptyState, Panel, PortalDataNotice, PortalPageHeader } from "@/components/portal/portal-ui";
import { formatDate, isClosedStatus } from "@/lib/portal-data";
import { getPortalSnapshot } from "@/lib/portal-records";

export default async function MaintenancePage() {
  const snapshot = await getPortalSnapshot();
  const openTasks = snapshot.maintenanceTasks.filter((task) => !task.completedAt && !isClosedStatus(task.status));
  const completedTasks = snapshot.maintenanceTasks.filter((task) => task.completedAt || isClosedStatus(task.status));

  return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
    <PortalPageHeader eyebrow="Planned care" title="Maintenance" description="Upcoming work, recurring service intervals, and coordinated seasonal preparation." />
    {snapshot.errorMessage ? <PortalDataNotice message={snapshot.errorMessage} /> : null}
    <Panel title="Upcoming work" eyebrow={`${openTasks.length} open task${openTasks.length === 1 ? "" : "s"}`} className="mt-7">{openTasks.length ? <div className="grid gap-px bg-black/10 md:grid-cols-2">{openTasks.map((item) => {
      const property = snapshot.properties.find((record) => record.id === item.propertyId);
      const vendor = snapshot.vendors.find((record) => record.id === item.vendorId);
      return <article key={item.id} className="flex min-h-44 items-start gap-5 bg-[#f8f7f2] p-5 sm:p-6"><span className="flex size-11 shrink-0 items-center justify-center border border-black/10 bg-white"><CalendarDays aria-hidden="true" className="size-4 text-[#80632d]" /></span><div><p className="text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-[#80632d]">{formatDate(item.dueDate)} · {item.status}</p><h2 className="mt-3 font-serif text-2xl">{item.title}</h2><p className="mt-2 text-xs text-black/42">{property?.name ?? "Property"} · {item.priority} priority{vendor ? ` · ${vendor.name}` : ""}</p>{item.description ? <p className="mt-3 text-xs leading-5 text-black/46">{item.description}</p> : null}{item.recurrence ? <p className="mt-4 text-[0.5rem] uppercase tracking-[0.12em] text-black/34">Repeats · {item.recurrence}</p> : null}</div></article>;
    })}</div> : <EmptyState title="Nothing scheduled" description="New maintenance tasks and recurring service intervals will appear here." />}</Panel>
    {completedTasks.length ? <Panel title="Completed work" eyebrow="History" className="mt-5"><div className="divide-y divide-black/10">{completedTasks.slice(0, 8).map((item) => <article key={item.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:px-6"><p className="text-xs font-medium text-[#80632d]">{formatDate(item.completedAt ?? item.updatedAt)}</p><div><h2 className="text-sm font-medium">{item.title}</h2><p className="mt-1 text-xs text-black/40">{snapshot.properties.find((record) => record.id === item.propertyId)?.name ?? "Property"}</p></div><p className="text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-black/36">{item.status}</p></article>)}</div></Panel> : null}
  </main>;
}
