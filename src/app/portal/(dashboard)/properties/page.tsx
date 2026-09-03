import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { HealthBadge } from "@/components/portal/health-badge";
import { EmptyState, Panel, PortalDataNotice, PortalPageHeader } from "@/components/portal/portal-ui";
import { formatDate } from "@/lib/portal-data";
import { getPortalSnapshot } from "@/lib/portal-records";

export default async function PropertiesPage() {
  const snapshot = await getPortalSnapshot();

  return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
    <PortalPageHeader eyebrow="Portfolio" title="Properties" description="The stewardship record for every residence in your APRISM relationship." />
    {snapshot.errorMessage ? <PortalDataNotice message={snapshot.errorMessage} /> : null}
    {snapshot.properties.length ? <div className="mt-7 grid gap-5">{snapshot.properties.map((property) => {
      const inspections = snapshot.inspections.filter((inspection) => inspection.propertyId === property.id);
      const lastInspection = inspections.find((inspection) => inspection.completedAt);
      const nextInspection = inspections.filter((inspection) => !inspection.completedAt).sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))[0];
      return <Link key={property.id} href={`/portal/properties/${property.id}`} className="group grid overflow-hidden border border-black/10 bg-[#f8f7f2] lg:grid-cols-[0.9fr_1.1fr]"><div className="portal-property-scene relative min-h-80"><div className="absolute left-6 top-6"><HealthBadge status={property.health} /></div></div><div className="flex flex-col justify-between p-6 sm:p-8"><div><p className="text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-[#8c6f3c]">{property.type}</p><h2 className="mt-4 font-serif text-4xl sm:text-5xl">{property.name}</h2><p className="mt-3 flex items-center gap-2 text-sm text-black/46"><MapPin aria-hidden="true" className="size-4" />{property.location}</p>{property.summary ? <p className="mt-5 max-w-2xl text-sm leading-6 text-black/48">{property.summary}</p> : null}</div><div className="mt-10 grid gap-5 border-t border-black/10 pt-6 sm:grid-cols-3"><div><p className="text-[0.52rem] uppercase tracking-[0.14em] text-black/34">Last inspection</p><p className="mt-2 text-sm">{formatDate(lastInspection?.completedAt)}</p></div><div><p className="text-[0.52rem] uppercase tracking-[0.14em] text-black/34">Next visit</p><p className="mt-2 text-sm">{formatDate(nextInspection?.scheduledFor)}</p></div><div className="flex items-end justify-between text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#80632d]">Open record <ArrowRight aria-hidden="true" className="size-4 transition group-hover:translate-x-1" /></div></div></div></Link>;
    })}</div> : <Panel title="Property records" eyebrow="Portfolio" className="mt-7"><EmptyState title="No property is linked yet" description="APRISM will add a residence here after your client membership is provisioned." /></Panel>}
  </main>;
}
