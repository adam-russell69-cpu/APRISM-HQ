import { Building2, CircleAlert, ClipboardList, MapPin } from "lucide-react";
import { requireStaff } from "@/lib/admin-account";
import { Metric, Panel, PortalPageHeader } from "@/components/portal/portal-ui";
import { updateInquiryStatus, updateServiceRequestStatus } from "./actions";

const formatDate = (value: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
const statusLabel = (value: string) => value.replaceAll("_", " ");

function getMountainGreeting(date: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "2-digit", hour12: false, timeZone: "America/Denver" }).format(date));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminPage() {
  const { supabase, account } = await requireStaff();
  const [inquiryResult, propertyResult, requestResult, issueResult] = await Promise.all([
    supabase.from("inquiries").select("id, name, email, phone, property_location, property_type, services, preferred_contact_method, message, status, created_at").order("created_at", { ascending: false }).limit(30),
    supabase.from("properties").select("id, name, city, state, health_status, updated_at").order("name"),
    supabase.from("service_requests").select("id, property_id, title, category, preferred_timing, status, created_at").order("created_at", { ascending: false }).limit(30),
    supabase.from("issues").select("id, property_id, title, severity, status, created_at").order("created_at", { ascending: false }).limit(30),
  ]);

  const inquiries = inquiryResult.data ?? [];
  const properties = propertyResult.data ?? [];
  const requests = requestResult.data ?? [];
  const issues = issueResult.data ?? [];
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const activeRequests = requests.filter((request) => !["completed", "cancelled"].includes(request.status));
  const activeIssues = issues.filter((issue) => !["resolved", "closed"].includes(issue.status));
  const newInquiries = inquiries.filter((inquiry) => inquiry.status === "new");

  return <main className="mx-auto max-w-[1560px] px-5 py-8 sm:px-8 lg:px-10 lg:py-11">
    <PortalPageHeader eyebrow="Private operations" title={`${getMountainGreeting(new Date())}, ${account.displayName.split(" ")[0]}.`} description="Your APRISM command center for prospective clients, active properties, service requests, and condition changes." />

    <section aria-label="Operating metrics" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="New inquiries" value={newInquiries.length} detail="Awaiting first response" />
      <Metric label="Properties" value={properties.length} detail="Active stewardship records" />
      <Metric label="Open requests" value={activeRequests.length} detail="Submitted through completion" />
      <Metric label="Open issues" value={activeIssues.length} detail="Monitoring and action items" />
    </section>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <Panel title="Property assessment inquiries" eyebrow="Business development">
        {inquiries.length ? <div className="divide-y divide-black/10">{inquiries.map((inquiry) => <article key={inquiry.id} className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h3 className="font-serif text-2xl">{inquiry.name}</h3><span className="bg-[#c7a76b]/18 px-2.5 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-[#745726]">{statusLabel(inquiry.status)}</span></div><p className="mt-2 flex items-center gap-2 text-xs text-black/48"><MapPin aria-hidden="true" className="size-3.5" />{inquiry.property_location} · {inquiry.property_type}</p><p className="mt-3 text-xs leading-6 text-black/55">{inquiry.message}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-black/45"><a className="underline underline-offset-4" href={`mailto:${inquiry.email}`}>{inquiry.email}</a><a className="underline underline-offset-4" href={`tel:${inquiry.phone}`}>{inquiry.phone}</a><span>{inquiry.services.join(" · ")}</span><span>{formatDate(inquiry.created_at)}</span></div></div>
            <form action={updateInquiryStatus} className="flex shrink-0 gap-2"><input type="hidden" name="id" value={inquiry.id} /><label className="sr-only" htmlFor={`inquiry-${inquiry.id}`}>Inquiry status</label><select id={`inquiry-${inquiry.id}`} name="status" defaultValue={inquiry.status} className="min-h-10 border border-black/15 bg-white px-3 text-xs capitalize"><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option></select><button type="submit" className="min-h-10 bg-[#191c1b] px-4 text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-white">Save</button></form>
          </div>
        </article>)}</div> : <div className="p-8 text-sm text-black/42">No property assessment inquiries yet.</div>}
      </Panel>

      <Panel title="Property portfolio" eyebrow="Stewardship">
        {properties.length ? <div className="divide-y divide-black/10">{properties.map((property) => <article key={property.id} className="flex items-start justify-between gap-4 p-5"><div><p className="font-serif text-xl">{property.name}</p><p className="mt-1 text-xs text-black/42">{property.city}, {property.state}</p></div><span className="shrink-0 text-[0.5rem] font-semibold uppercase tracking-[0.13em] text-[#80632d]">{property.health_status}</span></article>)}</div> : <div className="p-8 text-sm text-black/42">No active properties.</div>}
      </Panel>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <Panel title="Service requests" eyebrow="Client activity" action={<ClipboardList aria-hidden="true" className="size-4 text-black/30" />}>
        {requests.length ? <div className="divide-y divide-black/10">{requests.map((request) => <article key={request.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-medium">{request.title}</h3><p className="mt-1 text-xs text-black/42">{propertyNames.get(request.property_id) ?? "Property"} · {request.category} · {formatDate(request.created_at)}</p></div><form action={updateServiceRequestStatus} className="flex gap-2"><input type="hidden" name="id" value={request.id} /><label className="sr-only" htmlFor={`request-${request.id}`}>Request status</label><select id={`request-${request.id}`} name="status" defaultValue={request.status} className="min-h-10 border border-black/15 bg-white px-3 text-xs capitalize"><option value="submitted">Submitted</option><option value="reviewing">Reviewing</option><option value="scheduled">Scheduled</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><button type="submit" className="min-h-10 border border-black/15 px-3 text-[0.5rem] font-semibold uppercase tracking-[0.12em]">Save</button></form></article>)}</div> : <div className="p-8 text-sm text-black/42">No service requests.</div>}
      </Panel>

      <Panel title="Condition issues" eyebrow="Property health" action={<CircleAlert aria-hidden="true" className="size-4 text-black/30" />}>
        {issues.length ? <div className="divide-y divide-black/10">{issues.map((issue) => <article key={issue.id} className="flex items-start justify-between gap-5 p-5"><div><h3 className="text-sm font-medium">{issue.title}</h3><p className="mt-1 text-xs text-black/42">{propertyNames.get(issue.property_id) ?? "Property"} · {formatDate(issue.created_at)}</p></div><div className="text-right"><p className="text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-[#92544f]">{issue.severity}</p><p className="mt-2 text-[0.5rem] uppercase tracking-[0.12em] text-black/34">{statusLabel(issue.status)}</p></div></article>)}</div> : <div className="p-8 text-sm text-black/42">No open condition issues.</div>}
      </Panel>
    </div>

    <div className="mt-6 flex items-center gap-3 border border-black/10 bg-[#171b19] p-5 text-white"><Building2 aria-hidden="true" className="size-5 text-[#c7a76b]" /><p className="text-xs leading-5 text-white/55"><span className="font-medium text-white">Administrative access is separate from client access.</span> Client accounts remain limited to property records explicitly assigned through APRISM onboarding.</p></div>
  </main>;
}
