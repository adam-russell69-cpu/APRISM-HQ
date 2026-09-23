import Link from "next/link";
import { Plus, Wrench } from "lucide-react";
import { AdminPageHeader, adminPrimaryButton } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableRow, MobileLabel } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

export default async function VendorsPage() {
  const { supabase } = await requireStaff();
  const [{ data: vendors }, { data: assignments }] = await Promise.all([
    supabase.from("vendors").select("id, name, trade, primary_contact, email, phone, status, approval_checkpoint, updated_at").order("name"),
    supabase.from("property_vendors").select("vendor_id, property_id"),
  ]);
  const counts = new Map<string, number>();
  for (const assignment of assignments ?? []) counts.set(assignment.vendor_id, (counts.get(assignment.vendor_id) ?? 0) + 1);

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <AdminPageHeader
      eyebrow="Service network"
      title="Vendors"
      description="Build and vet APRISM's service network, from candidate intake through Preferred status."
      actions={<Link href="/admin/vendors/new" className={adminPrimaryButton}><Plus aria-hidden="true" className="size-4" />New Vendor</Link>}
    />
    <section className="mt-6">
      {vendors?.length ? <AdminTable columns={["Vendor", "Trade / category", "Status", "Approval checkpoint", "Assigned properties"]}>
        {vendors.map((vendor) => <AdminTableRow key={vendor.id} href={`/admin/vendors/${vendor.id}`} columns={5}>
          <div><MobileLabel>Vendor</MobileLabel><p className="font-serif text-xl">{vendor.name}</p><p className="mt-1 break-words text-xs text-black/45">{vendor.phone || vendor.email || "No contact recorded"}</p></div>
          <div><MobileLabel>Trade / category</MobileLabel><p className="text-black/58">{vendor.trade}</p></div>
          <div><MobileLabel>Status</MobileLabel><StatusBadge value={vendor.status || "Candidate"} /></div>
          <div><MobileLabel>Approval checkpoint</MobileLabel><p className="text-black/58">{(vendor.approval_checkpoint || "intake").replaceAll("_", " ")}</p></div>
          <div><MobileLabel>Assigned properties</MobileLabel><p className="text-black/58">{counts.get(vendor.id) ?? 0}</p></div>
        </AdminTableRow>)}
      </AdminTable> : <div className="border border-black/10 bg-white"><EmptyState icon={Wrench} title="No vendors" description="Trusted service partners will appear here after they are added to the vendor network." /></div>}
    </section>
  </main>;
}
