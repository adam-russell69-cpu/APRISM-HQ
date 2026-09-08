import { ClipboardCheck } from "lucide-react";
import { HealthBadge } from "@/components/portal/health-badge";
import { EmptyState, Panel, PortalDataNotice, PortalPageHeader } from "@/components/portal/portal-ui";
import { formatDate } from "@/lib/portal-data";
import { getPortalSnapshot } from "@/lib/portal-records";

export default async function InspectionsPage() {
  const snapshot = await getPortalSnapshot();
  return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
    <PortalPageHeader eyebrow="Documented visits" title="Inspections" description="Scheduled property observations, findings, photographs, and recommended follow-up." />
    {snapshot.errorMessage ? <PortalDataNotice message={snapshot.errorMessage} /> : null}
    <Panel title="Inspection history" eyebrow={`${snapshot.inspections.length} record${snapshot.inspections.length === 1 ? "" : "s"}`} className="mt-7">{snapshot.inspections.length ? <div className="divide-y divide-black/10">{snapshot.inspections.map((inspection) => {
      const property = snapshot.properties.find((item) => item.id === inspection.propertyId);
      const itemCount = snapshot.inspectionItems.filter((item) => item.inspectionId === inspection.id).length;
      return <article key={inspection.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:px-6"><p className="text-xs font-medium text-[#80632d]">{formatDate(inspection.completedAt ?? inspection.scheduledFor)}</p><div><h2 className="text-sm font-medium">{inspection.type}</h2><p className="mt-1 text-xs text-black/40">{property?.name ?? "Property"} · {inspection.status} · {itemCount} checkpoint{itemCount === 1 ? "" : "s"}</p>{inspection.summary ? <p className="mt-2 max-w-2xl text-xs leading-5 text-black/46">{inspection.summary}</p> : null}</div><div className="flex items-center gap-3"><ClipboardCheck aria-hidden="true" className="size-4 text-black/28" /><HealthBadge status={inspection.health} /></div></article>;
    })}</div> : <EmptyState title="No inspections recorded" description="Scheduled visits and completed inspection findings will appear here." />}</Panel>
  </main>;
}
