import { ArrowRight, CalendarDays, ClipboardCheck, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { HealthBadge } from "@/components/portal/health-badge";
import { EmptyState, Metric, Panel, PortalDataNotice, PortalPageHeader } from "@/components/portal/portal-ui";
import { getPortalAccount } from "@/lib/portal-account";
import { formatDate, formatMonthDay, isClosedStatus } from "@/lib/portal-data";
import { getPortalSnapshot } from "@/lib/portal-records";

function getMountainGreeting(date: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "2-digit", hour12: false, timeZone: "America/Denver" }).format(date));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function PortalDashboardPage() {
  const [account, snapshot] = await Promise.all([getPortalAccount(), getPortalSnapshot()]);
  const now = new Date();
  const firstName = account.fullName?.split(/\s+/)[0];
  const greeting = `${getMountainGreeting(now)}${firstName ? `, ${firstName}` : ""}.`;
  const dateLabel = new Intl.DateTimeFormat("en-US", { timeZone: "America/Denver", weekday: "long", month: "long", day: "numeric" }).format(now);
  const property = snapshot.properties[0];

  if (!property) {
    return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10"><PortalPageHeader eyebrow={dateLabel} title={greeting} description="Here is the current operating picture for your property." />{snapshot.errorMessage ? <PortalDataNotice message={snapshot.errorMessage} /> : null}<Panel title="Property record" eyebrow="Client portal" className="mt-7"><EmptyState title="No property is linked yet" description="APRISM will make the operating record available here after your property membership is provisioned." /></Panel></main>;
  }

  const propertyInspections = snapshot.inspections.filter((inspection) => inspection.propertyId === property.id);
  const lastInspection = propertyInspections.find((inspection) => inspection.completedAt);
  const nextInspection = propertyInspections.filter((inspection) => !inspection.completedAt).sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))[0];
  const openIssues = snapshot.issues.filter((issue) => issue.propertyId === property.id && !issue.resolvedAt && !isClosedStatus(issue.status));
  const upcomingMaintenance = snapshot.maintenanceTasks.filter((task) => task.propertyId === property.id && !task.completedAt && !isClosedStatus(task.status));
  const documents = snapshot.documents.filter((document) => document.propertyId === property.id);
  const systemsNeedingAttention = snapshot.systems.filter((system) => system.propertyId === property.id && system.status !== "Healthy").length;
  const recentObservations = lastInspection ? snapshot.inspectionItems.filter((item) => item.inspectionId === lastInspection.id).slice(0, 3) : [];

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
      <PortalPageHeader eyebrow={dateLabel} title={greeting} description="Here is the current operating picture for your property." action={<div className="flex flex-wrap gap-2">{account.staffRole ? <Link href="/admin" className="inline-flex min-h-11 items-center justify-center gap-2 border border-black/15 px-5 text-[0.58rem] font-semibold uppercase tracking-[0.15em]"><ShieldCheck aria-hidden="true" className="size-4" />Admin console</Link> : null}<Link href="/portal/requests" className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#1a1d1c] px-5 text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-white"><Plus aria-hidden="true" className="size-4" />Service request</Link></div>} />
      {snapshot.errorMessage ? <PortalDataNotice message={snapshot.errorMessage} /> : null}
      <section className="mt-7 grid overflow-hidden border border-black/10 bg-[#171b19] text-white lg:grid-cols-[1.15fr_0.85fr]">
        <div className="portal-property-scene relative min-h-80 overflow-hidden p-6 sm:p-8"><div className="relative z-10 flex h-full flex-col justify-between"><p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-white/46">Primary property</p><div><HealthBadge status={property.health} /><h2 className="mt-5 font-serif text-4xl sm:text-5xl">{property.name}</h2><p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/45">{property.location}</p></div></div></div>
        <div className="grid grid-cols-2 gap-px bg-white/10"><div className="bg-[#171b19] p-5 sm:p-7"><CalendarDays aria-hidden="true" className="size-4 text-[#c7a76b]" /><p className="mt-8 text-[0.54rem] uppercase tracking-[0.15em] text-white/35">Last inspection</p><p className="mt-2 text-sm">{formatDate(lastInspection?.completedAt)}</p></div><div className="bg-[#171b19] p-5 sm:p-7"><CalendarDays aria-hidden="true" className="size-4 text-[#c7a76b]" /><p className="mt-8 text-[0.54rem] uppercase tracking-[0.15em] text-white/35">Next visit</p><p className="mt-2 text-sm">{formatDate(nextInspection?.scheduledFor)}</p></div><Link href={`/portal/properties/${property.id}`} className="col-span-2 flex items-center justify-between bg-[#202421] p-5 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#d7ba82] sm:p-7">View property record <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
      </section>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Property health" value={property.health} detail={`${systemsNeedingAttention} tracked system${systemsNeedingAttention === 1 ? "" : "s"} need attention`} /><Metric label="Open issues" value={openIssues.length} detail={openIssues.some((issue) => issue.severity === "Critical") ? "Critical attention required" : "No critical issues"} /><Metric label="Upcoming maintenance" value={upcomingMaintenance.length} detail="Open scheduled tasks" /><Metric label="Documents" value={documents.length} detail="Records in your library" /></div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Open issues" eyebrow="Attention">{openIssues.length ? <div className="divide-y divide-black/10">{openIssues.slice(0, 4).map((issue) => { const vendor = snapshot.vendors.find((item) => item.id === issue.assignedVendorId); return <Link key={issue.id} href="/portal/issues" className="grid gap-4 px-5 py-5 transition hover:bg-black/[0.025] sm:grid-cols-[1fr_auto] sm:px-6"><div><HealthBadge status={issue.severity} /><h3 className="mt-3 text-sm font-medium">{issue.title}</h3><p className="mt-1 text-xs text-black/40">Opened {formatDate(issue.createdAt)} · {vendor?.name ?? "APRISM coordination"}</p></div><ArrowRight aria-hidden="true" className="mt-2 size-4 text-black/28" /></Link>; })}</div> : <EmptyState title="No open issues" description="New observations and their resolution status will appear here." />}</Panel>
        <Panel title="Upcoming maintenance" eyebrow="Scheduled care">{upcomingMaintenance.length ? <div className="divide-y divide-black/10">{upcomingMaintenance.slice(0, 4).map((item) => { const date = formatMonthDay(item.dueDate); return <div key={item.id} className="flex items-center gap-4 px-5 py-4 sm:px-6"><div className="flex size-12 shrink-0 flex-col items-center justify-center border border-black/12 bg-white"><span className="text-[0.5rem] uppercase text-black/36">{date.month}</span><span className="font-serif text-xl leading-none">{date.day}</span></div><div><h3 className="text-sm font-medium">{item.title}</h3><p className="mt-1 text-xs text-black/40">{item.priority} priority · {item.status}</p></div></div>; })}</div> : <EmptyState title="Nothing scheduled" description="Upcoming recurring and coordinated maintenance will appear here." />}</Panel>
      </div>
      <Panel title="Recent inspection observations" eyebrow={lastInspection ? formatDate(lastInspection.completedAt) : "Inspection record"} className="mt-5">{recentObservations.length ? <div className="grid gap-px bg-black/10 sm:grid-cols-3">{recentObservations.map((item) => <article key={item.id} className="bg-[#f8f7f2] p-5"><ClipboardCheck aria-hidden="true" className="size-4 text-[#80632d]" /><HealthBadge status={item.status} /><h3 className="mt-4 text-sm font-medium">{item.title}</h3><p className="mt-2 text-xs leading-5 text-black/42">{item.observation ?? item.recommendation ?? "Observation recorded."}</p></article>)}</div> : <EmptyState title="No observations recorded" description="Inspection checkpoints and recommendations will appear after a completed visit." />}</Panel>
    </main>
  );
}
