import Link from "next/link";
import { ChevronLeft, MapPin, ShieldAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { updateIssueStatus } from "../../actions";
import { ActionMenu, actionMenuItem } from "@/components/admin/action-menu";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge, labelStatus } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

const statuses = ["open", "monitoring", "in_progress", "resolved", "closed"];
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Denver" });
const severityLabel = (value: string) => ({ Critical: "Critical", "Action Recommended": "High", Monitor: "Medium", Healthy: "Low" }[value] ?? value);

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: issue } = await supabase.from("issues").select("id, property_id, assigned_vendor_id, title, description, severity, status, resolved_at, created_at, updated_at").eq("id", id).maybeSingle();
  if (!issue) notFound();
  const [{ data: property }, { data: vendor }] = await Promise.all([
    supabase.from("properties").select("id, name, address_line_1, city, state").eq("id", issue.property_id).maybeSingle(),
    issue.assigned_vendor_id ? supabase.from("vendors").select("id, name, trade").eq("id", issue.assigned_vendor_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  return <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><Link href="/admin/issues" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ChevronLeft aria-hidden="true" className="size-4" />All issues</Link>
    <AdminPageHeader eyebrow="Property issue" title={issue.title} description={`${property?.name ?? "Property"} · Created ${dateFormatter.format(new Date(issue.created_at))}`} actions={<div className="flex items-center gap-2"><StatusBadge value={severityLabel(issue.severity)} /><ActionMenu label="Update issue status">{statuses.map((status) => <form key={status} action={updateIssueStatus}><input type="hidden" name="id" value={issue.id} /><input type="hidden" name="status" value={status} /><button className={actionMenuItem} disabled={status === issue.status}>{labelStatus(status)}</button></form>)}</ActionMenu></div>} />
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]"><section className="border border-black/10 bg-white p-5 sm:p-7"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Observable condition</p><h2 className="mt-2 font-serif text-3xl">Finding detail</h2><p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-black/62">{issue.description || "No additional field notes were recorded."}</p><dl className="mt-7 grid gap-4 border-t border-black/10 pt-5 sm:grid-cols-3"><div><dt className="text-xs font-semibold text-black/35">APRISM health state</dt><dd className="mt-1 text-sm text-black/68">{issue.severity}</dd></div><div><dt className="text-xs font-semibold text-black/35">Operational severity</dt><dd className="mt-1 text-sm text-black/68">{severityLabel(issue.severity)}</dd></div><div><dt className="text-xs font-semibold text-black/35">Last updated</dt><dd className="mt-1 text-sm text-black/68">{dateFormatter.format(new Date(issue.updated_at))}</dd></div></dl></section><aside className="space-y-5"><section className="border border-black/10 bg-[#f8f6f0] p-5"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Property</p><h2 className="mt-2 font-serif text-2xl">{property?.name ?? "Property"}</h2><p className="mt-3 flex gap-2 text-sm leading-6 text-black/50"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />{property ? `${property.address_line_1}, ${property.city}, ${property.state}` : "Property record unavailable"}</p>{property ? <Link href={`/admin/properties/${property.id}`} className="mt-5 inline-flex min-h-11 items-center text-xs font-semibold text-[#7f622f] hover:text-black">Open property record</Link> : null}</section><section className="border border-black/10 bg-white p-5"><div className="flex gap-3"><ShieldAlert aria-hidden="true" className="mt-0.5 size-5 text-[#94733a]" /><div><p className="text-xs font-semibold text-black/35">Assigned vendor</p><p className="mt-1 text-sm font-semibold text-black/70">{vendor?.name ?? "Not assigned"}</p>{vendor ? <p className="mt-1 text-xs text-black/40">{vendor.trade}</p> : null}</div></div></section></aside></div>
  </main>;
}
