import { CalendarDays, ClipboardCheck, FileText, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HealthBadge } from "@/components/portal/health-badge";
import { EmptyState, Panel, PortalDataNotice } from "@/components/portal/portal-ui";
import { formatDate, formatFileSize, formatMonthDay, formatShortDate, isClosedStatus } from "@/lib/portal-data";
import { getPortalSnapshot } from "@/lib/portal-records";

type PropertyPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const [{ id }, snapshot] = await Promise.all([params, getPortalSnapshot()]);
  const property = snapshot.properties.find((item) => item.id === id);
  if (!property) return { title: "Property not found" };
  return { title: property.name, description: `APRISM property stewardship record for ${property.name} in ${property.location}.`, robots: { index: false, follow: false }, openGraph: { images: [] }, twitter: { images: [] } };
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const [{ id }, snapshot] = await Promise.all([params, getPortalSnapshot()]);
  const property = snapshot.properties.find((item) => item.id === id);

  if (!property) {
    if (!snapshot.errorMessage) notFound();
    return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10"><Link href="/portal/properties" className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-black/48">← Properties</Link><PortalDataNotice message={snapshot.errorMessage} /></main>;
  }

  const inspections = snapshot.inspections.filter((inspection) => inspection.propertyId === property.id);
  const completedInspections = inspections.filter((inspection) => inspection.completedAt);
  const lastInspection = completedInspections[0];
  const nextInspection = inspections.filter((inspection) => !inspection.completedAt).sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))[0];
  const systems = snapshot.systems.filter((system) => system.propertyId === property.id);
  const maintenance = snapshot.maintenanceTasks.filter((task) => task.propertyId === property.id);
  const upcomingMaintenance = maintenance.filter((task) => !task.completedAt && !isClosedStatus(task.status));
  const openIssues = snapshot.issues.filter((issue) => issue.propertyId === property.id && !issue.resolvedAt && !isClosedStatus(issue.status));
  const documents = snapshot.documents.filter((document) => document.propertyId === property.id);
  const propertyVendorLinks = snapshot.propertyVendors.filter((item) => item.propertyId === property.id);
  const vendors = propertyVendorLinks.map((link) => ({ link, vendor: snapshot.vendors.find((item) => item.id === link.vendorId) })).filter((item) => item.vendor);
  const inspectionIds = new Set(inspections.map((inspection) => inspection.id));
  const observations = snapshot.inspectionItems.filter((item) => inspectionIds.has(item.inspectionId));
  const serviceHistory = [
    ...completedInspections.map((inspection) => ({ id: `inspection-${inspection.id}`, date: inspection.completedAt ?? inspection.updatedAt, title: `${inspection.type} completed`, detail: inspection.summary ?? `${snapshot.inspectionItems.filter((item) => item.inspectionId === inspection.id).length} checkpoints recorded` })),
    ...maintenance.filter((task) => task.completedAt).map((task) => ({ id: `maintenance-${task.id}`, date: task.completedAt ?? task.updatedAt, title: task.title, detail: task.description ?? "Maintenance completed" })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
      <div className="grid overflow-hidden border border-black/10 bg-[#171b19] text-white lg:grid-cols-[1.05fr_0.95fr]">
        <div className="portal-property-scene relative min-h-[24rem] p-6 sm:p-8"><div className="relative z-10 flex h-full flex-col justify-between"><Link href="/portal/properties" className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white/48">← Properties</Link><div><HealthBadge status={property.health} /><h1 className="mt-5 font-serif text-5xl leading-none sm:text-6xl">{property.name}</h1><p className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/48"><MapPin aria-hidden="true" className="size-4" />{property.location}</p></div></div></div>
        <div className="grid grid-cols-2 gap-px bg-white/10"><div className="bg-[#171b19] p-5 sm:p-7"><p className="text-[0.52rem] uppercase tracking-[0.15em] text-white/34">Residence</p><p className="mt-3 text-sm">{property.type}</p></div><div className="bg-[#171b19] p-5 sm:p-7"><p className="text-[0.52rem] uppercase tracking-[0.15em] text-white/34">Size</p><p className="mt-3 text-sm">{property.size}</p></div><div className="bg-[#171b19] p-5 sm:p-7"><p className="text-[0.52rem] uppercase tracking-[0.15em] text-white/34">Built</p><p className="mt-3 text-sm">{property.built}</p></div><div className="bg-[#171b19] p-5 sm:p-7"><p className="text-[0.52rem] uppercase tracking-[0.15em] text-white/34">APRISM since</p><p className="mt-3 text-sm">{formatDate(property.createdAt)}</p></div><div className="col-span-2 flex items-center gap-3 bg-[#202421] p-5 text-xs text-white/55 sm:p-7"><CalendarDays aria-hidden="true" className="size-4 text-[#c7a76b]" />Next scheduled visit · {formatDate(nextInspection?.scheduledFor)}</div></div>
      </div>
      <nav aria-label="Property sections" className="mt-5 flex gap-2 overflow-x-auto border border-black/10 bg-[#f8f7f2] p-2 text-[0.54rem] font-semibold uppercase tracking-[0.14em] text-black/45">{["Overview", "Systems", "History", "Documents", "Vendors", "Observations", "Calendar"].map((item) => <a key={item} href={`#${item.toLowerCase()}`} className="shrink-0 px-4 py-3 transition hover:bg-black/[0.04] hover:text-black">{item}</a>)}</nav>
      <div id="overview" className="mt-5 grid scroll-mt-24 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Property overview" eyebrow="Stewardship summary"><div className="grid gap-px bg-black/10 sm:grid-cols-2">{[["Current status", property.health], ["Last inspection", formatDate(lastInspection?.completedAt)], ["Open issues", `${openIssues.length} active`], ["Next scheduled visit", formatDate(nextInspection?.scheduledFor)], ["Upcoming maintenance", `${upcomingMaintenance.length} open task${upcomingMaintenance.length === 1 ? "" : "s"}`], ["Property record", `Current as of ${formatShortDate(property.updatedAt)}`]].map(([label, value]) => <div key={label} className="bg-[#f8f7f2] p-5"><p className="text-[0.5rem] uppercase tracking-[0.14em] text-black/34">{label}</p><p className="mt-2 text-sm">{value}</p></div>)}</div>{property.summary ? <p className="border-t border-black/10 px-5 py-5 text-sm leading-6 text-black/48 sm:px-6">{property.summary}</p> : null}</Panel>
        <Panel title="Maintenance calendar" eyebrow="Upcoming" className="scroll-mt-20" action={<Link href="/portal/maintenance" className="text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-[#80632d]">View calendar</Link>}>{upcomingMaintenance.length ? <div id="calendar" className="divide-y divide-black/10 scroll-mt-24">{upcomingMaintenance.slice(0, 5).map((item) => { const date = formatMonthDay(item.dueDate); return <div key={item.id} className="flex items-center gap-4 px-5 py-4"><div className="flex size-11 shrink-0 flex-col items-center justify-center border border-black/12 bg-white"><span className="text-[0.45rem] uppercase text-black/35">{date.month}</span><span className="font-serif text-lg">{date.day}</span></div><div><p className="text-sm">{item.title}</p><p className="mt-1 text-xs text-black/38">{item.status}</p></div></div>; })}</div> : <EmptyState title="Nothing scheduled" description="Upcoming maintenance will appear here." />}</Panel>
      </div>
      <Panel title="Systems & equipment" eyebrow="Operating record" className="mt-5 scroll-mt-24"><div id="systems" className="divide-y divide-black/10 scroll-mt-24">{systems.length ? systems.map((system) => { const detail = [system.manufacturer, system.modelNumber, system.notes].filter(Boolean).join(" · ") || system.category; return <div key={system.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:px-6"><div><h3 className="text-sm font-medium">{system.name}</h3><p className="mt-1 text-xs text-black/42">{detail}</p></div><p className="text-xs text-black/42">{system.serviceInterval ? `Service interval · ${system.serviceInterval}` : `Updated ${formatShortDate(system.updatedAt)}`}</p><HealthBadge status={system.status} /></div>; }) : <EmptyState title="No systems recorded" description="Tracked equipment, service intervals, and condition will appear here." />}</div></Panel>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="Service history" eyebrow="Recent activity">{serviceHistory.length ? <div id="history" className="divide-y divide-black/10 scroll-mt-24">{serviceHistory.map((item) => <div key={item.id} className="grid grid-cols-[5.25rem_1fr] gap-4 px-5 py-4 sm:px-6"><p className="text-xs font-medium text-[#80632d]">{formatShortDate(item.date)}</p><div><p className="text-sm">{item.title}</p><p className="mt-1 text-xs text-black/40">{item.detail}</p></div></div>)}</div> : <EmptyState title="No completed service yet" description="Completed inspections and maintenance will build this history." />}</Panel>
        <Panel title="Documents" eyebrow="Property library">{documents.length ? <div id="documents" className="divide-y divide-black/10 scroll-mt-24">{documents.slice(0, 8).map((document) => <div key={document.id} className="flex items-center gap-4 px-5 py-4 sm:px-6"><span className="flex size-10 shrink-0 items-center justify-center border border-black/10 bg-white"><FileText aria-hidden="true" className="size-4 text-[#80632d]" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm">{document.name}</p><p className="mt-1 text-xs text-black/38">{document.category} · {formatShortDate(document.updatedAt)}{formatFileSize(document.sizeBytes) ? ` · ${formatFileSize(document.sizeBytes)}` : ""}</p></div><span className="text-[0.48rem] font-semibold uppercase tracking-[0.12em] text-black/32">On file</span></div>)}</div> : <EmptyState title="No documents on file" description="Plans, warranties, and service records will appear here." />}</Panel>
      </div>
      <Panel title="Vendor contacts" eyebrow="Approved network" className="mt-5"><div id="vendors" className="grid gap-px bg-black/10 scroll-mt-24 sm:grid-cols-3">{vendors.length ? vendors.map(({ link, vendor }) => vendor ? <article key={link.id} className="bg-[#f8f7f2] p-5"><p className="text-[0.5rem] uppercase tracking-[0.14em] text-[#80632d]">{link.scope ?? vendor.trade}</p><h3 className="mt-4 font-serif text-2xl">{vendor.name}</h3><p className="mt-2 text-xs text-black/42">{vendor.primaryContact ? `Primary contact · ${vendor.primaryContact}` : "Coordinated through APRISM"}</p>{link.isPreferred ? <p className="mt-6 text-[0.5rem] font-semibold uppercase tracking-[0.13em] text-black/42">Preferred partner</p> : null}</article> : null) : <div className="col-span-full bg-[#f8f7f2]"><EmptyState title="No linked vendors" description="Approved property partners will appear here." /></div>}</div></Panel>
      <Panel title="Inspection observations" eyebrow="Documented checkpoints" className="mt-5"><div id="observations" className="grid scroll-mt-24 gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-3">{observations.length ? observations.slice(0, 9).map((item) => <article key={item.id} className="bg-[#f8f7f2] p-5"><div className="flex items-center justify-between gap-3"><ClipboardCheck aria-hidden="true" className="size-4 text-[#80632d]" /><HealthBadge status={item.status} /></div><h3 className="mt-4 text-sm font-medium">{item.title}</h3><p className="mt-1 text-[0.52rem] uppercase tracking-[0.12em] text-black/34">{item.area ?? "Property"}</p><p className="mt-3 text-xs leading-5 text-black/42">{item.observation ?? item.recommendation ?? "Observation recorded."}</p>{item.photoCount ? <p className="mt-4 text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-[#80632d]">{item.photoCount} photo{item.photoCount === 1 ? "" : "s"} on file</p> : null}</article>) : <div className="col-span-full bg-[#f8f7f2]"><EmptyState title="No observations recorded" description="Inspection checkpoints and recommendations will appear here." /></div>}</div></Panel>
    </main>
  );
}
