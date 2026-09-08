import Link from "next/link";
import { ChevronLeft, Clock3, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { updateServiceRequestStatus } from "../../actions";
import { ActionMenu, actionMenuItem } from "@/components/admin/action-menu";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge, labelStatus } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

const statuses = ["submitted", "reviewing", "scheduled", "in_progress", "completed", "cancelled"];
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Denver" });

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: request } = await supabase.from("service_requests").select("id, property_id, title, category, description, preferred_timing, status, created_at, updated_at").eq("id", id).maybeSingle();
  if (!request) notFound();
  const { data: property } = await supabase.from("properties").select("id, name, address_line_1, city, state").eq("id", request.property_id).maybeSingle();

  return <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <Link href="/admin/requests" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ChevronLeft aria-hidden="true" className="size-4" />All requests</Link>
    <AdminPageHeader eyebrow="Service request" title={request.title} description={`${property?.name ?? "Property"} · Received ${dateFormatter.format(new Date(request.created_at))}`} actions={<div className="flex items-center gap-2"><StatusBadge value={request.status} /><ActionMenu label="Update request status">{statuses.map((status) => <form key={status} action={updateServiceRequestStatus}><input type="hidden" name="id" value={request.id} /><input type="hidden" name="status" value={status} /><button className={actionMenuItem} disabled={status === request.status}>{labelStatus(status)}</button></form>)}</ActionMenu></div>} />
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="border border-black/10 bg-white p-5 sm:p-7"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Request detail</p><h2 className="mt-2 font-serif text-3xl">Scope and context</h2><p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-black/62">{request.description}</p><dl className="mt-7 grid gap-4 border-t border-black/10 pt-5 sm:grid-cols-3"><div><dt className="text-xs font-semibold text-black/35">Category</dt><dd className="mt-1 text-sm text-black/68">{request.category}</dd></div><div><dt className="text-xs font-semibold text-black/35">Preferred timing</dt><dd className="mt-1 text-sm text-black/68">{request.preferred_timing || "Not specified"}</dd></div><div><dt className="text-xs font-semibold text-black/35">Last updated</dt><dd className="mt-1 text-sm text-black/68">{dateFormatter.format(new Date(request.updated_at))}</dd></div></dl></section>
      <aside className="space-y-5"><section className="border border-black/10 bg-[#f8f6f0] p-5"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Property</p><h2 className="mt-2 font-serif text-2xl">{property?.name ?? "Property"}</h2><p className="mt-3 flex gap-2 text-sm leading-6 text-black/50"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />{property ? `${property.address_line_1}, ${property.city}, ${property.state}` : "Property record unavailable"}</p>{property ? <Link href={`/admin/properties/${property.id}`} className="mt-5 inline-flex min-h-11 items-center text-xs font-semibold text-[#7f622f] hover:text-black">Open property record</Link> : null}</section><section className="border border-black/10 bg-white p-5"><div className="flex items-center gap-3"><Clock3 aria-hidden="true" className="size-5 text-[#94733a]" /><div><p className="text-xs font-semibold text-black/35">Current state</p><p className="mt-1 text-sm font-semibold text-black/70">{labelStatus(request.status)}</p></div></div></section></aside>
    </div>
  </main>;
}
