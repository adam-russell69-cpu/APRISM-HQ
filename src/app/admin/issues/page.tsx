import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableRow, MobileLabel } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

const filters = ["priority", "open", "monitoring", "resolved"] as const;
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const severityLabel = (value: string) => ({ Critical: "Critical", "Action Recommended": "High", Monitor: "Medium", Healthy: "Low" }[value] ?? value);

export default async function IssuesPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const activeView = filters.includes(view as (typeof filters)[number]) ? view as (typeof filters)[number] : "open";
  const { supabase } = await requireStaff();
  const [{ data: issues }, { data: properties }] = await Promise.all([
    supabase.from("issues").select("id, property_id, title, severity, status, created_at").order("created_at", { ascending: false }),
    supabase.from("properties").select("id, name"),
  ]);
  const propertyNames = new Map((properties ?? []).map((property) => [property.id, property.name]));
  const records = (issues ?? []).filter((issue) => activeView === "priority" ? ["Critical", "Action Recommended"].includes(issue.severity) && !["resolved", "closed"].includes(issue.status) : activeView === "resolved" ? ["resolved", "closed"].includes(issue.status) : issue.status === activeView);

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><AdminPageHeader eyebrow="Property health" title="Issues" description="Keep observable conditions visible, prioritize intervention, and document resolution without losing property context." />
    <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-black/10" aria-label="Issue filters">{filters.map((filter) => <Link key={filter} href={`/admin/issues?view=${filter}`} className={`min-h-11 shrink-0 border-b-2 px-4 py-3 text-sm font-semibold capitalize ${filter === activeView ? "border-[#9a793e] text-black" : "border-transparent text-black/40 hover:text-black"}`}>{filter}</Link>)}</nav>
    <section className="mt-5">{records.length ? <AdminTable columns={["Property", "Issue", "Severity", "Status", "Created"]}>{records.map((issue) => <AdminTableRow key={issue.id} href={`/admin/issues/${issue.id}`} columns={5}><div><MobileLabel>Property</MobileLabel><p className="font-serif text-lg">{propertyNames.get(issue.property_id) ?? "Property"}</p></div><div><MobileLabel>Issue</MobileLabel><p className="font-semibold text-black/70">{issue.title}</p></div><div><MobileLabel>Severity</MobileLabel><StatusBadge value={severityLabel(issue.severity)} /></div><div><MobileLabel>Status</MobileLabel><StatusBadge value={issue.status} /></div><div><MobileLabel>Created</MobileLabel><p className="text-black/42">{dateFormatter.format(new Date(issue.created_at))}</p></div></AdminTableRow>)}</AdminTable> : <div className="border border-black/10 bg-white"><EmptyState icon={ShieldCheck} title={`No ${activeView} issues`} description={activeView === "open" ? "Nothing currently requires intervention." : "Issues will appear here when they match this operational state."} /></div>}</section>
  </main>;
}
