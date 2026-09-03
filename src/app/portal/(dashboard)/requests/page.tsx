import { RequestForm } from "@/components/portal/request-form";
import { EmptyState, Panel, PortalDataNotice, PortalPageHeader } from "@/components/portal/portal-ui";
import { formatDate } from "@/lib/portal-data";
import { getPortalSnapshot } from "@/lib/portal-records";

export default async function RequestsPage() {
  const snapshot = await getPortalSnapshot();
  return <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
    <PortalPageHeader eyebrow="Client coordination" title="Service requests" description="Give APRISM the context, timing, and access details needed to coordinate the right next step." />
    {snapshot.errorMessage ? <PortalDataNotice message={snapshot.errorMessage} /> : null}
    <div className="mt-7 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel title="New service request" eyebrow={snapshot.properties.length === 1 ? snapshot.properties[0].name : "Select a property"}>{snapshot.properties.length ? <RequestForm properties={snapshot.properties.map(({ id, name }) => ({ id, name }))} /> : <EmptyState title="No property is linked yet" description="A property membership is required before a service request can be submitted." />}</Panel>
      <Panel title="Recent requests" eyebrow="History">{snapshot.serviceRequests.length ? <div className="divide-y divide-black/10">{snapshot.serviceRequests.slice(0, 8).map((request) => <article key={request.id} className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium">{request.title}</p><p className="mt-2 text-xs text-black/40">{snapshot.properties.find((property) => property.id === request.propertyId)?.name ?? "Property"} · {request.category} · {formatDate(request.createdAt)}</p></div><p className="shrink-0 text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-[#80632d]">{request.status}</p></div>{request.preferredTiming ? <p className="mt-3 text-xs text-black/42">Preferred timing · {request.preferredTiming}</p> : null}</article>)}</div> : <EmptyState title="No service requests yet" description="Submitted requests and their coordination status will appear here." />}</Panel>
    </div>
  </main>;
}
