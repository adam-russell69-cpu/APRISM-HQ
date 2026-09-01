import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus, Search } from "lucide-react";
import { AdminPageHeader, adminPrimaryButton } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableRow, MobileLabel } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

export const metadata: Metadata = { title: "Properties" };
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Denver" });
const filters = ["All", "Healthy", "Monitor", "Action Recommended"] as const;

export default async function AdminPropertiesPage({ searchParams }: { searchParams: Promise<{ q?: string; health?: string }> }) {
  const { q = "", health = "All" } = await searchParams;
  const { supabase } = await requireStaff();
  const [{ data: properties }, { data: issues }, { data: requests }] = await Promise.all([
    supabase.from("properties").select("id, name, address_line_1, city, state, health_status, updated_at").order("name").limit(100),
    supabase.from("issues").select("property_id, status"),
    supabase.from("service_requests").select("property_id, status"),
  ]);
  const query = q.trim().toLowerCase();
  const records = (properties ?? []).filter((property) => (!query || [property.name, property.address_line_1, property.city, property.state].some((value) => value.toLowerCase().includes(query))) && (health === "All" || !filters.includes(health as (typeof filters)[number]) || property.health_status === health));

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <AdminPageHeader eyebrow="Stewardship portfolio" title="Properties" description="Open the residence first, then move through systems, maintenance, issues, vendors, documents, and members in context." actions={<Link href="/admin/properties/new" className={adminPrimaryButton}><Plus aria-hidden="true" className="size-4" />Add Property</Link>} />
    <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><form className="flex w-full max-w-md items-center border border-black/12 bg-white px-3"><Search aria-hidden="true" className="size-4 text-black/30" /><label className="sr-only" htmlFor="property-search">Search properties</label><input id="property-search" name="q" defaultValue={q} placeholder="Search property, address, or city" className="min-h-11 w-full bg-transparent px-3 text-sm outline-none placeholder:text-black/30" /></form><nav aria-label="Property health filters" className="flex gap-1 overflow-x-auto">{filters.map((filter) => <Link key={filter} href={`/admin/properties?health=${encodeURIComponent(filter)}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`whitespace-nowrap border px-3.5 py-2.5 text-xs font-semibold ${health === filter ? "border-[#9a793e] bg-[#9a793e]/8 text-black" : "border-black/10 bg-white text-black/42"}`}>{filter}</Link>)}</nav></div>
    <section className="mt-5">{records.length ? <AdminTable columns={["Property", "City / community", "Health", "Open issues", "Open requests", "Last updated"]}>{records.map((property) => { const issueCount = (issues ?? []).filter((issue) => issue.property_id === property.id && !["resolved", "closed"].includes(issue.status)).length; const requestCount = (requests ?? []).filter((request) => request.property_id === property.id && !["completed", "cancelled"].includes(request.status)).length; return <AdminTableRow key={property.id} href={`/admin/properties/${property.id}`} columns={6}><div><MobileLabel>Property</MobileLabel><p className="font-serif text-xl">{property.name}</p><p className="mt-1 text-xs text-black/35">{property.address_line_1}</p></div><div><MobileLabel>City / community</MobileLabel><p className="text-black/58">{property.city}, {property.state}</p></div><div><MobileLabel>Health</MobileLabel><StatusBadge value={property.health_status} /></div><div><MobileLabel>Open issues</MobileLabel><p className="text-black/55">{issueCount}</p></div><div><MobileLabel>Open requests</MobileLabel><p className="text-black/55">{requestCount}</p></div><div><MobileLabel>Last updated</MobileLabel><p className="text-black/42">{dateFormatter.format(new Date(property.updated_at))}</p></div></AdminTableRow>; })}</AdminTable> : <div className="border border-black/10 bg-white"><EmptyState icon={Building2} title="No matching properties" description={query ? "Try a broader property search or clear the health filter." : "No properties have been added to the stewardship portfolio."} /></div>}</section>
  </main>;
}
