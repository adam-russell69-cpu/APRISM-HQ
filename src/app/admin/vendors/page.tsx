import { Wrench } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableRow, MobileLabel } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { requireStaff } from "@/lib/admin-account";

export default async function VendorsPage() {
  const { supabase } = await requireStaff();
  const [{ data: vendors }, { data: assignments }] = await Promise.all([
    supabase.from("vendors").select("id, name, trade, primary_contact, email, phone, updated_at").order("name"),
    supabase.from("property_vendors").select("vendor_id, property_id"),
  ]);
  const counts = new Map<string, number>();
  for (const assignment of assignments ?? []) counts.set(assignment.vendor_id, (counts.get(assignment.vendor_id) ?? 0) + 1);

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><AdminPageHeader eyebrow="Service network" title="Vendors" description="Review the trusted trades and specialists associated with APRISM properties. Vendor management remains read-only in this pass." />
    <section className="mt-6">{vendors?.length ? <AdminTable columns={["Vendor", "Trade / category", "Primary contact", "Phone / email", "Assigned properties"]}>{vendors.map((vendor) => <AdminTableRow key={vendor.id} href={`/admin/vendors/${vendor.id}`} columns={5}><div><MobileLabel>Vendor</MobileLabel><p className="font-serif text-xl">{vendor.name}</p></div><div><MobileLabel>Trade / category</MobileLabel><p className="text-black/58">{vendor.trade}</p></div><div><MobileLabel>Primary contact</MobileLabel><p className="text-black/58">{vendor.primary_contact || "Not recorded"}</p></div><div><MobileLabel>Phone / email</MobileLabel><p className="break-words text-xs leading-5 text-black/50">{vendor.phone || vendor.email || "Not recorded"}</p></div><div><MobileLabel>Assigned properties</MobileLabel><p className="text-black/58">{counts.get(vendor.id) ?? 0}</p></div></AdminTableRow>)}</AdminTable> : <div className="border border-black/10 bg-white"><EmptyState icon={Wrench} title="No vendors" description="Trusted service partners will appear here after they are added to the vendor network." /></div>}</section>
  </main>;
}
