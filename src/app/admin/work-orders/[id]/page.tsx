import Link from "next/link";
import { ChevronLeft, Clock3, MapPin, Play, Square, Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FieldVisitCapture } from "@/components/admin/field-visit-capture";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";
import { endVisit, startVisit } from "../actions";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Denver" });

function minutesLabel(minutes: number | null) {
  if (minutes == null) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

export default async function WorkOrderFieldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: workOrder } = await supabase.from("work_orders").select("id, property_id, service_request_id, title, description, status, priority, source, scheduled_at, created_at, completed_at").eq("id", id).maybeSingle();
  if (!workOrder) notFound();

  const [propertyResult, visitsResult, activityResult] = await Promise.all([
    workOrder.property_id ? supabase.from("properties").select("id, name, address_line_1, city, state, postal_code, sensitive_access_notes").eq("id", workOrder.property_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("service_visits").select("id, technician_id, started_at, ended_at, duration_minutes, diagnosis, work_performed, recommendation, client_notes, outcome, return_reason").eq("work_order_id", id).order("started_at", { ascending: false }),
    supabase.from("work_order_activity").select("id, event_type, details, visibility, created_at").eq("work_order_id", id).order("created_at", { ascending: false }).limit(30),
  ]);

  const property = propertyResult.data;
  const visits = visitsResult.data ?? [];
  const activeVisit = visits.find((visit) => visit.started_at && !visit.ended_at) ?? null;
  const totalMinutes = visits.reduce((sum, visit) => sum + (visit.duration_minutes ?? 0), 0);
  const [materialsResult, photosResult] = activeVisit ? await Promise.all([
    supabase.from("visit_materials").select("id, description, quantity, unit_cost, client_charge, supplied_by").eq("service_visit_id", activeVisit.id).order("created_at", { ascending: false }),
    supabase.from("service_visit_photos").select("id, category, visibility, caption").eq("service_visit_id", activeVisit.id).order("created_at", { ascending: false }),
  ]) : [{ data: [] }, { data: [] }];

  return <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
    <Link href="/admin/work-orders" className="mb-4 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ChevronLeft aria-hidden="true" className="size-4" />Work orders</Link>
    <AdminPageHeader eyebrow="V1-A field mode" title={workOrder.title} description={`${property?.name ?? "Property"} · ${String(workOrder.source).replaceAll("_", " ")}`} actions={<StatusBadge value={workOrder.status} />} />

    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_330px]">
      <section className="space-y-5">
        <div className="border border-black/10 bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><Wrench aria-hidden="true" className="mt-1 size-5 text-[#8d6b32]" /><div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-black/40">Job scope</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-black/65">{workOrder.description || "No additional description was provided."}</p></div></div></div>

        {activeVisit ? <>
          <FieldVisitCapture workOrderId={workOrder.id} materials={materialsResult.data ?? []} photos={photosResult.data ?? []} />
          <form action={endVisit} className="border-2 border-[#8c6c33]/35 bg-[#fbf8ef] p-5 sm:p-6">
            <input type="hidden" name="workOrderId" value={workOrder.id} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#80622f]">Visit active</p><h2 className="mt-1 font-serif text-3xl">Field timer running</h2><p className="mt-2 text-xs text-black/50">Started {dateFormatter.format(new Date(activeVisit.started_at!))}</p></div><div className="inline-flex min-h-12 items-center gap-2 self-start bg-[#1d211f] px-4 text-xs font-semibold text-white"><Clock3 aria-hidden="true" className="size-4" />In progress</div></div>
            <div className="mt-6 grid gap-4">
              <label className="text-xs font-semibold text-black/55">Diagnosis<textarea name="diagnosis" rows={3} className="mt-2 w-full border border-black/15 bg-white p-3 text-sm outline-none focus:border-[#8c6c33]" placeholder="What did you find?" /></label>
              <label className="text-xs font-semibold text-black/55">Work performed<textarea name="workPerformed" rows={3} className="mt-2 w-full border border-black/15 bg-white p-3 text-sm outline-none focus:border-[#8c6c33]" placeholder="What did you do?" /></label>
              <label className="text-xs font-semibold text-black/55">Recommendation<textarea name="recommendation" rows={2} className="mt-2 w-full border border-black/15 bg-white p-3 text-sm outline-none focus:border-[#8c6c33]" placeholder="Recommended next step" /></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-black/55">Client-visible note<textarea name="clientNotes" rows={3} className="mt-2 w-full border border-black/15 bg-white p-3 text-sm outline-none focus:border-[#8c6c33]" /></label><label className="text-xs font-semibold text-black/55">APRISM internal note<textarea name="internalNotes" rows={3} className="mt-2 w-full border border-black/15 bg-white p-3 text-sm outline-none focus:border-[#8c6c33]" /></label></div>
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-black/55">Visit outcome<select name="outcome" required defaultValue="complete" className="mt-2 min-h-12 w-full border border-black/15 bg-white px-3 text-sm"><option value="complete">Job complete</option><option value="return_required">Return visit required</option></select></label><label className="text-xs font-semibold text-black/55">Return reason<select name="returnReason" defaultValue="" className="mt-2 min-h-12 w-full border border-black/15 bg-white px-3 text-sm"><option value="">Not applicable</option><option value="waiting_parts">Waiting for parts</option><option value="awaiting_approval">Awaiting approval</option><option value="additional_diagnosis">Additional diagnosis</option><option value="scheduled_return">Scheduled return</option><option value="other">Other</option></select></label></div>
            </div>
            <button type="submit" className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 bg-[#1c211f] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white"><Square aria-hidden="true" className="size-4" />End visit</button>
          </form>
        </> : <form action={startVisit} className="border border-black/10 bg-white p-5 sm:p-6"><input type="hidden" name="workOrderId" value={workOrder.id} /><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#80622f]">Ready for field work</p><h2 className="mt-1 font-serif text-3xl">Start the next visit</h2><p className="mt-3 text-sm leading-6 text-black/50">Starting a visit records the arrival timestamp and moves this work order to In Progress.</p><button type="submit" disabled={["completed", "cancelled", "invoiced", "paid"].includes(workOrder.status)} className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 bg-[#1c211f] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-40"><Play aria-hidden="true" className="size-4" />Start visit</button></form>}

        <section className="border border-black/10 bg-white"><div className="border-b border-black/10 p-5 sm:p-6"><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#80622f]">Visit history</p><h2 className="mt-1 font-serif text-2xl">{visits.length} visit{visits.length === 1 ? "" : "s"} · {minutesLabel(totalMinutes)}</h2></div>{visits.length ? <div className="divide-y divide-black/8">{visits.map((visit, index) => <article key={visit.id} className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">Visit {visits.length - index}</p><p className="mt-1 text-xs text-black/40">{visit.started_at ? dateFormatter.format(new Date(visit.started_at)) : "Not started"} · {visit.ended_at ? minutesLabel(visit.duration_minutes) : "Active"}</p></div>{visit.outcome ? <span className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-[#80622f]">{visit.outcome.replaceAll("_", " ")}</span> : null}</div>{visit.diagnosis ? <p className="mt-4 text-sm leading-6 text-black/58"><strong className="text-black/70">Diagnosis:</strong> {visit.diagnosis}</p> : null}{visit.work_performed ? <p className="mt-2 text-sm leading-6 text-black/58"><strong className="text-black/70">Work:</strong> {visit.work_performed}</p> : null}</article>)}</div> : <p className="p-6 text-sm text-black/45">No field visits recorded yet.</p>}</section>
      </section>

      <aside className="space-y-5">
        <section className="border border-black/10 bg-[#f8f6f0] p-5"><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#80622f]">Property</p><h2 className="mt-2 font-serif text-2xl">{property?.name ?? "Property"}</h2>{property ? <><p className="mt-3 flex gap-2 text-sm leading-6 text-black/52"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />{property.address_line_1}<br />{property.city}, {property.state} {property.postal_code}</p>{property.sensitive_access_notes ? <div className="mt-5 border border-[#a57f3f]/25 bg-white p-4"><p className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-[#80622f]">Private access note</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-black/58">{property.sensitive_access_notes}</p></div> : null}<Link href={`/admin/properties/${property.id}`} className="mt-5 inline-flex min-h-10 items-center text-xs font-semibold text-[#76592b]">Open Asset Passport</Link></> : null}</section>
        <section className="border border-black/10 bg-white p-5"><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-black/40">Job facts</p><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-xs text-black/38">Priority</dt><dd className="mt-1 font-semibold capitalize">{workOrder.priority}</dd></div><div><dt className="text-xs text-black/38">Created</dt><dd className="mt-1">{dateFormatter.format(new Date(workOrder.created_at))}</dd></div><div><dt className="text-xs text-black/38">Scheduled</dt><dd className="mt-1">{workOrder.scheduled_at ? dateFormatter.format(new Date(workOrder.scheduled_at)) : "Not scheduled"}</dd></div></dl></section>
        <section className="border border-black/10 bg-white p-5"><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-black/40">Activity</p><div className="mt-4 space-y-4">{(activityResult.data ?? []).length ? (activityResult.data ?? []).slice(0, 8).map((event) => <div key={event.id} className="border-l border-black/12 pl-3"><p className="text-xs font-semibold capitalize text-black/65">{event.event_type.replaceAll("_", " ")}</p><p className="mt-1 text-[0.68rem] text-black/38">{dateFormatter.format(new Date(event.created_at))}</p></div>) : <p className="text-xs text-black/42">No activity yet.</p>}</div></section>
      </aside>
    </div>
  </main>;
}
