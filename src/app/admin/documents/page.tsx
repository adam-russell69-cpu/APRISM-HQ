import { FileText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableRow, MobileLabel } from "@/components/admin/admin-table";
import { DocumentDownloadCard } from "@/components/admin/document-download-card";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const references = [
  { href: "/documents/assessments/APRISM_Property_Assessment_Intake_Fillable.pdf", title: "Client Intake PDF", description: "Public client reference" },
  { href: "/admin/assessments/documents/APRISM_Field_Assessment_Checklist.pdf", title: "Field Checklist PDF", description: "Protected staff reference" },
  { href: "/admin/assessments/documents/APRISM_Property_Assessment_Report_Template_Fillable.pdf", title: "Report Template PDF", description: "Protected staff reference" },
];

export default async function DocumentsPage() {
  const { supabase } = await requireStaff();
  const [{ data: documents }, { data: properties }] = await Promise.all([
    supabase.from("documents").select("id, property_id, name, category, mime_type, size_bytes, created_at").order("created_at", { ascending: false }),
    supabase.from("properties").select("id, name"),
  ]);
  const propertyNames = new Map((properties ?? []).map((property) => [property.id, property.name]));
  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><AdminPageHeader eyebrow="Private records" title="Documents" description="Mobile-ready staff records. Open reference PDFs or download them to Files for offline field use." />
    <section className="mt-6 grid gap-4 lg:grid-cols-3">{references.map((item) => <DocumentDownloadCard key={item.href} {...item} />)}</section>
    <section className="mt-7"><div className="mb-4"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Property document register</p></div>{documents?.length ? <AdminTable columns={["Document", "Property", "Category", "Created", "Visibility"]}>{documents.map((document) => <AdminTableRow key={document.id} columns={5}><div><MobileLabel>Document</MobileLabel><p className="font-semibold text-black/70">{document.name}</p><p className="mt-1 text-xs text-black/32">{document.mime_type || "File"}{document.size_bytes ? ` · ${Math.max(1, Math.round(document.size_bytes / 1024))} KB` : ""}</p></div><div><MobileLabel>Property</MobileLabel><p className="font-serif text-lg">{propertyNames.get(document.property_id) ?? "Property"}</p></div><div><MobileLabel>Category</MobileLabel><p className="text-black/52">{document.category}</p></div><div><MobileLabel>Created</MobileLabel><p className="text-black/42">{dateFormatter.format(new Date(document.created_at))}</p></div><div><MobileLabel>Visibility</MobileLabel><StatusBadge value="Private" /></div></AdminTableRow>)}</AdminTable> : <div className="border border-black/10 bg-white"><EmptyState icon={FileText} title="No property documents" description="Private records will appear here after they are associated with a property." /></div>}</section>
  </main>;
}
