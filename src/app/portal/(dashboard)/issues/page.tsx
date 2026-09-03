import { HealthBadge } from "@/components/portal/health-badge";
import { EmptyState, Panel, PortalDataNotice, PortalPageHeader } from "@/components/portal/portal-ui";
import { formatDate, isClosedStatus } from "@/lib/portal-data";
import { getPortalSnapshot } from "@/lib/portal-records";

export default async function IssuesPage() {
  const snapshot = await getPortalSnapshot();
  const openIssues = snapshot.issues.filter((issue) => !issue.resolvedAt && !isClosedStatus(issue.status));
  const resolvedIssues = snapshot.issues.filter((issue) => issue.resolvedAt || isClosedStatus(issue.status));

  return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
    <PortalPageHeader eyebrow="Condition tracking" title="Issues" description="Observed conditions remain visible from first report through recommendation, coordination, and resolution." />
    {snapshot.errorMessage ? <PortalDataNotice message={snapshot.errorMessage} /> : null}
    <Panel title="Open issues" eyebrow={`${openIssues.length} active`} className="mt-7">{openIssues.length ? <div className="divide-y divide-black/10">{openIssues.map((issue) => {
      const property = snapshot.properties.find((item) => item.id === issue.propertyId);
      const vendor = snapshot.vendors.find((item) => item.id === issue.assignedVendorId);
      return <article key={issue.id} className="grid gap-5 px-5 py-6 sm:grid-cols-[1fr_auto] sm:px-6"><div><HealthBadge status={issue.severity} /><h2 className="mt-4 font-serif text-2xl">{issue.title}</h2><p className="mt-2 text-xs text-black/40">{property?.name ?? "Property"} · Opened {formatDate(issue.createdAt)} · {vendor ? `Coordinating with ${vendor.name}` : "APRISM coordination"}</p>{issue.description ? <p className="mt-3 max-w-3xl text-xs leading-5 text-black/46">{issue.description}</p> : null}</div><p className="text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-[#80632d]">{issue.status}</p></article>;
    })}</div> : <EmptyState title="No open issues" description="New conditions and recommended follow-up will appear here." />}</Panel>
    {resolvedIssues.length ? <Panel title="Resolved issues" eyebrow="History" className="mt-5"><div className="divide-y divide-black/10">{resolvedIssues.map((issue) => <article key={issue.id} className="grid gap-3 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"><div><h2 className="text-sm font-medium">{issue.title}</h2><p className="mt-1 text-xs text-black/40">Resolved {formatDate(issue.resolvedAt ?? issue.updatedAt)} · {snapshot.properties.find((item) => item.id === issue.propertyId)?.name ?? "Property"}</p></div><HealthBadge status={issue.severity} /></article>)}</div></Panel> : null}
  </main>;
}
