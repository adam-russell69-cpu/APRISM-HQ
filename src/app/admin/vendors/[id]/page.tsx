import Link from "next/link";
import { ChevronLeft, Mail, Phone, Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableRow, MobileLabel } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: vendor } = await supabase.from("vendors").select("id, name, trade, primary_contact, email, phone, notes, created_at, updated_at").eq("id", id).maybeSingle();
  if (!vendor) notFound();
  const { data: assignments } = await supabase.from("property_vendors").select("id, property_id, scope, is_preferred, updated_at").eq("vendor_id", id);
  const propertyIds = (assignments ?? []).map((assignment) => assignment.property_id);
  const { data: properties } = propertyIds.length ? await supabase.from("properties").select("id, name, city, state, health_status").in("id", propertyIds) : { data: [] };
  const propertyMap = new Map((properties ?? []).map((property) => [property.id, property]));

  return <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><Link href="/admin/vendors" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ChevronLeft aria-hidden="true" className="size-4" />All vendors</Link><AdminPageHeader eyebrow={vendor.trade} title={vendor.name} description="Trusted vendor relationship and assigned-property view." />
    <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]"><aside className="border border-black/10 bg-[#f8f6f0] p-5"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Contact</p><p className="mt-4 font-serif text-2xl">{vendor.primary_contact || vendor.name}</p><div className="mt-5 space-y-3 text-sm text-black/55">{vendor.phone ? <a href={`tel:${vendor.phone}`} className="flex min-h-10 items-center gap-3 hover:text-black"><Phone aria-hidden="true" className="size-4 text-[#8f713d]" />{vendor.phone}</a> : null}{vendor.email ? <a href={`mailto:${vendor.email}`} className="flex min-h-10 items-center gap-3 break-all hover:text-black"><Mail aria-hidden="true" className="size-4 text-[#8f713d]" />{vendor.email}</a> : null}{!vendor.phone && !vendor.email ? <p>No contact information recorded.</p> : null}</div>{vendor.notes ? <p className="mt-6 border-t border-black/10 pt-5 text-sm leading-6 text-black/50">{vendor.notes}</p> : null}</aside><section>{assignments?.length ? <AdminTable columns={["Property", "Location", "Scope", "Preferred", "Health"]}>{assignments.map((assignment) => { const property = propertyMap.get(assignment.property_id); return <AdminTableRow key={assignment.id} href={`/admin/properties/${assignment.property_id}?tab=vendors`} columns={5}><div><MobileLabel>Property</MobileLabel><p className="font-serif text-xl">{property?.name ?? "Property"}</p></div><div><MobileLabel>Location</MobileLabel><p className="text-black/52">{property ? `${property.city}, ${property.state}` : "Not available"}</p></div><div><MobileLabel>Scope</MobileLabel><p className="text-black/52">{assignment.scope || "General"}</p></div><div><MobileLabel>Preferred</MobileLabel><StatusBadge value={assignment.is_preferred ? "Preferred" : "Active"} /></div><div><MobileLabel>Health</MobileLabel>{property ? <StatusBadge value={property.health_status} /> : "—"}</div></AdminTableRow>; })}</AdminTable> : <div className="border border-black/10 bg-white"><EmptyState icon={Wrench} title="No assigned properties" description="This vendor is not currently linked to a property record." /></div>}</section></div>
  </main>;
}
