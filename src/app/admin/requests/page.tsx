import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableRow, MobileLabel } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

const views = [
  { key: "open", label: "Open", statuses: ["submitted", "reviewing"] },
  { key: "scheduled", label: "Scheduled", statuses: ["scheduled"] },
  { key: "in-progress", label: "In Progress", statuses: ["in_progress"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
] as const;

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const activeView = views.find((item) => item.key === view) ?? views[0];
  const { supabase } = await requireStaff();
  const [{ data: requests }, { data: properties }] = await Promise.all([
    supabase.from("service_requests").select("id, property_id, title, category, preferred_timing, status, created_at").order("created_at", { ascending: false }),
    supabase.from("properties").select("id, name"),
  ]);
  const propertyNames = new Map((properties ?? []).map((property) => [property.id, property.name]));
  const records = (requests ?? []).filter((request) => (activeView.statuses as readonly string[]).includes(request.status));

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <AdminPageHeader eyebrow="Client service" title="Requests" description="Review incoming service needs, establish timing, and keep each property request moving to completion." />
    <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-black/10" aria-label="Request status">
      {views.map((item) => <Link key={item.key} href={`/admin/requests?view=${item.key}`} className={`min-h-11 shrink-0 border-b-2 px-4 py-3 text-sm font-semibold ${item.key === activeView.key ? "border-[#9a793e] text-black" : "border-transparent text-black/40 hover:text-black"}`}>{item.label}</Link>)}
    </nav>
    <section className="mt-5">
      {records.length ? <AdminTable columns={["Property", "Request", "Category", "Timing", "Status", "Submitted"]}>{records.map((request) => <AdminTableRow key={request.id} href={`/admin/requests/${request.id}`} columns={6}><div><MobileLabel>Property</MobileLabel><p className="font-serif text-lg">{propertyNames.get(request.property_id) ?? "Property"}</p></div><div><MobileLabel>Request</MobileLabel><p className="font-semibold text-black/70">{request.title}</p></div><div><MobileLabel>Category</MobileLabel><p className="text-black/52">{request.category}</p></div><div><MobileLabel>Timing</MobileLabel><p className="text-black/52">{request.preferred_timing || "Not specified"}</p></div><div><MobileLabel>Status</MobileLabel><StatusBadge value={request.status} /></div><div><MobileLabel>Submitted</MobileLabel><p className="text-black/42">{dateFormatter.format(new Date(request.created_at))}</p></div></AdminTableRow>)}</AdminTable> : <div className="border border-black/10 bg-white"><EmptyState icon={ClipboardList} title={`No ${activeView.label.toLowerCase()} requests`} description={activeView.key === "open" ? "No new service requests require review." : "Requests will appear here as their status changes."} /></div>}
    </section>
  </main>;
}
