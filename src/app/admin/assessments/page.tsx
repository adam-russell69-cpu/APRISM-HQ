import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, Plus } from "lucide-react";
import { AdminPageHeader, adminPrimaryButton } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableRow, MobileLabel } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

export const metadata: Metadata = { title: "Property Assessments" };
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Denver" });
type IntakeData = { owner_name?: string; client_name?: string; property_address?: string; property_name?: string; property_label?: string };

const views = [
  { key: "all", label: "All" },
  { key: "intakes", label: "New Intakes" },
  { key: "field", label: "Field Work" },
  { key: "reports", label: "Reports" },
  { key: "completed", label: "Completed" },
] as const;

function stageFor(status: string) {
  if (["completed", "published"].includes(status)) return "Complete";
  if (status === "report_draft") return "Report draft";
  if (["field_draft", "scheduled"].includes(status)) return "Field assessment";
  return "Intake received";
}

function nextAction(status: string) {
  if (status === "intake_received") return "Start field assessment";
  if (["field_draft", "scheduled"].includes(status)) return "Continue field assessment";
  if (status === "report_draft") return "Continue report";
  return "View record";
}

export default async function AdminAssessmentsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view = "all" } = await searchParams;
  const { supabase } = await requireStaff();
  const [{ data: assessments }, { data: properties }] = await Promise.all([
    supabase.from("property_assessments").select("id, property_id, status, assessment_date, intake_data, created_at, updated_at").order("updated_at", { ascending: false }).limit(100),
    supabase.from("properties").select("id, name, city"),
  ]);
  const records = assessments ?? [];
  const propertyNames = new Map((properties ?? []).map((property) => [property.id, property.name]));
  const filtered = records.filter((assessment) => {
    if (view === "intakes") return assessment.status === "intake_received";
    if (view === "field") return ["field_draft", "scheduled"].includes(assessment.status);
    if (view === "reports") return assessment.status === "report_draft";
    if (view === "completed") return ["completed", "published"].includes(assessment.status);
    return true;
  });

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <AdminPageHeader eyebrow="Property stewardship" title="Property Assessments" description="A single operational record from private client intake through field work, report, and completion." actions={<Link href="/admin/assessments/new" className={adminPrimaryButton}><Plus aria-hidden="true" className="size-4" />New Field Assessment</Link>} />

    <nav aria-label="Assessment views" className="mt-6 flex gap-1 overflow-x-auto border-b border-black/10">
      {views.map((item) => { const active = (view === item.key) || (!views.some((candidate) => candidate.key === view) && item.key === "all"); const count = records.filter((assessment) => item.key === "all" || (item.key === "intakes" && assessment.status === "intake_received") || (item.key === "field" && ["field_draft", "scheduled"].includes(assessment.status)) || (item.key === "reports" && assessment.status === "report_draft") || (item.key === "completed" && ["completed", "published"].includes(assessment.status))).length; return <Link key={item.key} href={`/admin/assessments?view=${item.key}`} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${active ? "border-[#9a793e] text-black" : "border-transparent text-black/40 hover:text-black"}`}>{item.label}<span className="ml-2 text-xs font-normal text-black/30">{count}</span></Link>; })}
    </nav>

    <section className="mt-5">
      {filtered.length ? <AdminTable columns={["Client", "Property", "Stage", "Assessment date", "Updated", "Next action"]}>{filtered.map((assessment) => {
        const intake = assessment.intake_data as IntakeData;
        const property = intake.property_address || intake.property_label || intake.property_name || propertyNames.get(assessment.property_id ?? "") || "Property not linked";
        const client = intake.owner_name || intake.client_name || "Client not provided";
        return <AdminTableRow key={assessment.id} href={`/admin/assessments/${assessment.id}`} columns={6}>
          <div><MobileLabel>Client</MobileLabel><p className="font-medium text-black/75">{client}</p></div>
          <div><MobileLabel>Property</MobileLabel><p className="text-black/62">{property}</p></div>
          <div><MobileLabel>Stage</MobileLabel><StatusBadge value={stageFor(assessment.status)} /></div>
          <div><MobileLabel>Assessment date</MobileLabel><p className="text-black/48">{assessment.assessment_date ? dateFormatter.format(new Date(`${assessment.assessment_date}T12:00:00Z`)) : "Not scheduled"}</p></div>
          <div><MobileLabel>Submitted / updated</MobileLabel><p className="text-black/48">{dateFormatter.format(new Date(assessment.updated_at ?? assessment.created_at))}</p></div>
          <div><MobileLabel>Next action</MobileLabel><p className="text-xs font-semibold text-[#765a29]">{nextAction(assessment.status)} →</p></div>
        </AdminTableRow>;
      })}</AdminTable> : <div className="border border-black/10 bg-white"><EmptyState icon={ClipboardCheck} title="No property assessments found" description={view === "all" ? "No property assessments have been started." : "There are no assessments in this workflow stage."} /></div>}
    </section>
  </main>;
}
