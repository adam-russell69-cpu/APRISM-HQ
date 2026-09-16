import { notFound } from "next/navigation";
import { Clock3, LockKeyhole, MapPin, Play, Square, UserRound, Wrench } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";
import { endVisit, startVisit } from "../actions";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Denver",
});

const fieldClass = "mt-2 min-h-12 w-full border border-black/12 bg-white px-4 text-sm outline-none focus:border-[#9a793e]";
const labelClass = "text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-black/45";

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();

  const { data: workOrder, error } = await supabase
    .from("work_orders")
    .select("id, client_account_id, property_id, title, description, status, priority, source, scheduled_at, completed_at, created_at, properties(name, address_line_1, city, state, postal_code, sensitive_access_notes), client_accounts(display_name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !workOrder) notFound();

  const [{ data: visits }, { data: activity }] = await Promise.all([
    supabase.from("service_visits").select("id, technician_id, started_at, ended_at, duration_minutes, diagnosis, work_performed, recommendation, outcome, return_reason, internal_notes, client_notes, created_at").eq("work_order_id", id).order("created_at", { ascending: false }),
    supabase.from("work_order_activity").select("id, event_type, details, visibility, created_at").eq("work_order_id", id).order("created_at", { ascending: false }),
  ]);

  const propertyRelation = Array.isArray(workOrder.properties) ? workOrder.properties[0] : workOrder.properties;
  const accountRelation = Array.isArray(workOrder.client_accounts) ? workOrder.client_accounts[0] : workOrder.client_accounts;
  const activeVisit = (visits ?? []).find((visit) => visit.started_at && !visit.ended_at) ?? null;
  const closed = ["completed", "cancelled", "invoiced", "paid"].includes(workOrder.status);
  const address = propertyRelation ? [propertyRelation.address_line_1, propertyRelation.city, propertyRelation.state, propertyRelation.postal_code].filter(Boolean).join(", ") : "No property address";

  return <main className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <AdminPageHeader eyebrow={`${accountRelation?.display_name ?? "APRISM client"} · ${workOrder.source.replaceAll("_", " ")}`} title={workOrder.title} description={workOrder.description || "Field service work order"} />

    <div className="mt-6 flex flex-wrap items-center gap-2"><StatusBadge value={workOrder.status} /><span className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-black/35">{workOrder.priority} priority</span></div>

    <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
      <div className="border border-black/10 bg-white p-5 sm:p-6">
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-black/35">Field location</p>
        <div className="mt-3 flex gap-3"><MapPin aria-hidden="true" className="mt-0.5 size-5 text-[#9a793e]" /><div><p className="font-serif text-xl">{propertyRelation?.name ?? "Property"}</p><p className="mt-1 text-sm text-black/50">{address}</p></div></div>
        {propertyRelation?.sensitive_access_notes ? <div className="mt-5 border border-[#9a793e]/20 bg-[#f6f0e4] p-4"><p className="flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-[#765b2d]"><LockKeyhole aria-hidden="true" className="size-4" />APRISM private access notes</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/65">{propertyRelation.sensitive_access_notes}</p></div> : null}
      </div>

      <div className="border border-black/10 bg-[#171a19] p-5 text-white sm:p-6">
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/45">Current visit</p>
        {activeVisit ? <>
          <div className="mt-4 flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-full bg-[#c7a76b]/15"><Clock3 aria-hidden="true" className="size-5 text-[#d6ba7d]" /></div><div><p className="text-lg font-semibold">Visit in progress</p><p className="mt-1 text-xs text-white/48">Started {dateTimeFormatter.format(new Date(activeVisit.started_at))}</p></div></div>
          <p className="mt-5 text-xs leading-5 text-white/45">Document the visit below before ending it. The timer remains active until END VISIT is submitted.</p>
        </> : <>
          <div className="mt-4 flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-full bg-white/5"><Wrench aria-hidden="true" className="size-5 text-white/55" /></div><div><p className="text-lg font-semibold">No active visit</p><p className="mt-1 text-xs text-white/48">{closed ? "This work order is closed." : "Start the timer when you arrive on site."}</p></div></div>
          {!closed ? <form action={startVisit} className="mt-6"><input type="hidden" name="workOrderId" value={workOrder.id} /><button type="submit" className="flex min-h-14 w-full items-center justify-center gap-2 bg-[#c7a76b] px-5 text-sm font-bold text-[#171a19]"><Play aria-hidden="true" className="size-5" />START VISIT</button></form> : null}
        </>}
      </div>
    </section>

    {activeVisit ? <section className="mt-5 border border-black/10 bg-[#f8f7f2] p-5 sm:p-7">
      <div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#8a6b35]">Mobile field record</p><h2 className="mt-2 font-serif text-2xl">End this visit</h2><p className="mt-2 text-sm leading-6 text-black/45">Capture enough context that nobody has to reconstruct this service call later.</p></div>
      <form action={endVisit} className="mt-6 grid gap-5">
        <input type="hidden" name="workOrderId" value={workOrder.id} />
        <label className={labelClass}>Diagnosis<textarea name="diagnosis" className={`${fieldClass} min-h-24 py-3`} placeholder="What did you find?" /></label>
        <label className={labelClass}>Work performed<textarea name="workPerformed" className={`${fieldClass} min-h-24 py-3`} placeholder="What did you do during this visit?" /></label>
        <label className={labelClass}>Recommendation<textarea name="recommendation" className={`${fieldClass} min-h-20 py-3`} placeholder="Recommended next action, if any" /></label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>Client-visible note<textarea name="clientNotes" className={`${fieldClass} min-h-24 py-3`} placeholder="Safe to show manager/homeowner" /></label>
          <label className={labelClass}>APRISM internal note<textarea name="internalNotes" className={`${fieldClass} min-h-24 py-3`} placeholder="Private technician/admin note" /></label>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>Visit outcome<select name="outcome" className={fieldClass} defaultValue="return_required"><option value="return_required">Return visit required</option><option value="complete">Job complete</option></select></label>
          <label className={labelClass}>Return reason<select name="returnReason" className={fieldClass} defaultValue="scheduled_return"><option value="scheduled_return">Scheduled return</option><option value="waiting_parts">Waiting for parts</option><option value="awaiting_approval">Awaiting approval</option><option value="additional_diagnosis">Additional diagnosis</option></select></label>
        </div>
        <button type="submit" className="flex min-h-14 items-center justify-center gap-2 bg-[#171a19] px-6 text-sm font-bold text-white"><Square aria-hidden="true" className="size-5" />END VISIT</button>
      </form>
    </section> : null}

    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      <div className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-5 py-4"><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-black/35">Visit history</p></div>
        {(visits ?? []).length ? <div className="divide-y divide-black/10">{(visits ?? []).map((visit, index) => <article key={visit.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">Visit {(visits ?? []).length - index}</p><p className="mt-1 text-xs text-black/42">{visit.started_at ? dateTimeFormatter.format(new Date(visit.started_at)) : "Not started"}{visit.duration_minutes !== null ? ` · ${visit.duration_minutes} min` : " · Active"}</p></div>{visit.outcome ? <span className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#80632d]">{visit.outcome.replaceAll("_", " ")}</span> : null}</div>{visit.diagnosis ? <p className="mt-4 text-sm leading-6 text-black/58"><strong>Diagnosis:</strong> {visit.diagnosis}</p> : null}{visit.work_performed ? <p className="mt-2 text-sm leading-6 text-black/58"><strong>Work:</strong> {visit.work_performed}</p> : null}{visit.recommendation ? <p className="mt-2 text-sm leading-6 text-black/58"><strong>Next:</strong> {visit.recommendation}</p> : null}</article>)}</div> : <div className="p-6 text-sm text-black/42">No visits recorded yet.</div>}
      </div>

      <div className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-5 py-4"><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-black/35">Activity</p></div>
        {(activity ?? []).length ? <div className="divide-y divide-black/10">{(activity ?? []).map((event) => <div key={event.id} className="flex gap-3 p-5"><UserRound aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-black/25" /><div><p className="text-sm font-medium">{event.event_type.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-black/40">{dateTimeFormatter.format(new Date(event.created_at))}</p></div></div>)}</div> : <div className="p-6 text-sm text-black/42">No activity recorded yet.</div>}
      </div>
    </section>
  </main>;
}
