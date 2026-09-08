import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronLeft, Download, Eye, FileText } from "lucide-react";
import { markAssessmentComplete } from "@/app/admin/assessments/actions";
import { ActionMenu, actionMenuItem } from "@/components/admin/action-menu";
import { AdminPageHeader, adminPrimaryButton, adminSecondaryButton } from "@/components/admin/admin-page-header";
import { AssessmentReportTool, FieldAssessmentTool, type AssessmentDefaults } from "@/components/admin/assessment-tools";
import { PrintControl } from "@/components/admin/print-control";
import { StatusBadge } from "@/components/admin/status-badge";
import { WorkflowStepper } from "@/components/admin/workflow-stepper";
import { requireStaff } from "@/lib/admin-account";
import { intakeSections } from "@/lib/assessment-config";

export const metadata: Metadata = { title: "Assessment Record" };
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Denver" });
type IntakeData = Record<string, string | boolean> & { owner_name?: string; client_name?: string; property_address?: string; property_name?: string; property_label?: string; email?: string; phone?: string };

function stageFor(status: string) {
  if (["completed", "published"].includes(status)) return "Complete";
  if (status === "report_draft") return "Report draft";
  if (["field_draft", "scheduled"].includes(status)) return "Field assessment";
  return "Intake received";
}

function defaultTab(status: string) {
  if (status === "report_draft") return "report";
  if (["field_draft", "scheduled"].includes(status)) return "field";
  return "intake";
}

export default async function AssessmentDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const requested = (await searchParams).tab;
  const { supabase } = await requireStaff();
  const [{ data: assessment }, { data: properties }, { data: inquiries }] = await Promise.all([
    supabase.from("property_assessments").select("id, property_id, inquiry_id, status, assessment_date, intake_data, field_notes, findings, report_data, stewardship_recommendation, created_at, updated_at").eq("id", id).maybeSingle(),
    supabase.from("properties").select("id, name, address_line_1, city, state, health_status").order("name"),
    supabase.from("inquiries").select("id, name, property_location").order("created_at", { ascending: false }).limit(100),
  ]);
  if (!assessment) notFound();

  const intake = (assessment.intake_data ?? {}) as IntakeData;
  const property = (properties ?? []).find((item) => item.id === assessment.property_id);
  const propertyLabel = intake.property_address || intake.property_label || intake.property_name || property?.name || "Property assessment";
  const clientName = intake.owner_name || intake.client_name || "Client not provided";
  const allowedTabs = new Set(["intake", "field", "report", "documents"]);
  const tab = requested && allowedTabs.has(requested) ? requested : defaultTab(assessment.status);
  const options = (properties ?? []).map((item) => ({ id: item.id, label: `${item.name} · ${item.city}` }));
  const inquiryOptions = (inquiries ?? []).map((item) => ({ id: item.id, label: `${item.name} · ${item.property_location}` }));
  const defaults: AssessmentDefaults = {
    id: assessment.id,
    propertyId: assessment.property_id,
    inquiryId: assessment.inquiry_id,
    clientName,
    propertyLabel,
    assessmentDate: assessment.assessment_date,
    fieldNotes: assessment.field_notes as AssessmentDefaults["fieldNotes"],
    findings: assessment.findings as AssessmentDefaults["findings"],
    reportData: assessment.report_data as AssessmentDefaults["reportData"],
  };
  const actionTab = assessment.status === "report_draft" ? "report" : "field";
  const actionLabel = assessment.status === "intake_received" ? "Start Field Assessment" : assessment.status === "report_draft" ? "Continue Report" : ["completed", "published"].includes(assessment.status) ? "View Intake" : "Continue Field Assessment";

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <Link href="/admin/assessments" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ChevronLeft aria-hidden="true" className="size-4" />All assessments</Link>
    <AdminPageHeader eyebrow={clientName} title={propertyLabel} description={`Submitted ${dateFormatter.format(new Date(assessment.created_at))} · Updated ${dateFormatter.format(new Date(assessment.updated_at))}`} actions={<><StatusBadge value={stageFor(assessment.status)} /><Link href={`/admin/assessments/${assessment.id}?tab=${["completed", "published"].includes(assessment.status) ? "intake" : actionTab}`} className={adminPrimaryButton}>{actionLabel}</Link><Link href={`/admin/assessments/${assessment.id}?tab=intake`} className={adminSecondaryButton}><Eye aria-hidden="true" className="size-4" />View Intake</Link><PrintControl /><ActionMenu><form action={markAssessmentComplete}><input type="hidden" name="assessment_id" value={assessment.id} /><button type="submit" className={actionMenuItem}>Mark complete</button></form><Link href="/admin/assessments" className={actionMenuItem}>Return to assessments</Link></ActionMenu></>} />

    <section className="mt-6"><WorkflowStepper status={assessment.status} /></section>

    <nav aria-label="Assessment record sections" className="print-hidden mt-6 flex gap-1 overflow-x-auto border-b border-black/10">
      {[{ key: "intake", label: "Intake" }, { key: "field", label: "Field Assessment" }, { key: "report", label: "Report" }, { key: "documents", label: "Documents" }].map((item) => <Link key={item.key} href={`/admin/assessments/${assessment.id}?tab=${item.key}`} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${tab === item.key ? "border-[#9a793e] text-black" : "border-transparent text-black/40 hover:text-black"}`}>{item.label}</Link>)}
    </nav>

    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="min-w-0">
        {tab === "intake" ? <div className="space-y-3">{intakeSections.map((section) => { const values = section.fields.map((field) => ({ label: field.label, value: intake[field.name] })).filter((item) => item.value !== undefined && item.value !== "" && item.value !== false); if (!values.length) return null; return <section key={section.eyebrow} className="border border-black/10 bg-white p-5 sm:p-6"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">{section.title}</p><dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">{values.map((item) => <div key={item.label}><dt className="text-xs font-semibold text-black/38">{item.label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-black/68">{item.value === true ? "Yes" : String(item.value)}</dd></div>)}</dl></section>; })}</div> : null}
        {tab === "field" ? <FieldAssessmentTool properties={options} inquiries={inquiryOptions} defaults={defaults} /> : null}
        {tab === "report" ? <AssessmentReportTool properties={options} inquiries={inquiryOptions} defaults={defaults} /> : null}
        {tab === "documents" ? <div className="border border-black/10 bg-white p-5 sm:p-7"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Staff reference library</p><h2 className="mt-2 font-serif text-3xl">Assessment documents</h2><div className="mt-6 grid gap-3"><a href="/documents/assessments/APRISM_Property_Assessment_Intake_Fillable.pdf" className="flex items-center justify-between border border-black/10 p-4 text-sm font-semibold hover:bg-[#faf8f3]"><span className="flex items-center gap-3"><FileText aria-hidden="true" className="size-4 text-[#8f713d]" />Client Intake PDF</span><Download aria-hidden="true" className="size-4 text-black/30" /></a><a href="/admin/assessments/documents/APRISM_Field_Assessment_Checklist.pdf" className="flex items-center justify-between border border-black/10 p-4 text-sm font-semibold hover:bg-[#faf8f3]"><span className="flex items-center gap-3"><FileText aria-hidden="true" className="size-4 text-[#8f713d]" />Field Assessment Checklist</span><Download aria-hidden="true" className="size-4 text-black/30" /></a><a href="/admin/assessments/documents/APRISM_Property_Assessment_Report_Template_Fillable.pdf" className="flex items-center justify-between border border-black/10 p-4 text-sm font-semibold hover:bg-[#faf8f3]"><span className="flex items-center gap-3"><FileText aria-hidden="true" className="size-4 text-[#8f713d]" />Report Template</span><Download aria-hidden="true" className="size-4 text-black/30" /></a></div></div> : null}
      </section>

      <aside className="h-fit border border-black/10 bg-white p-5 xl:sticky xl:top-24"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Client & property</p><h2 className="mt-2 font-serif text-2xl">Summary</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-xs font-semibold text-black/35">Client</dt><dd className="mt-1 text-black/68">{clientName}</dd></div><div><dt className="text-xs font-semibold text-black/35">Property</dt><dd className="mt-1 text-black/68">{propertyLabel}</dd></div>{intake.email ? <div><dt className="text-xs font-semibold text-black/35">Email</dt><dd className="mt-1 break-words text-black/68">{intake.email}</dd></div> : null}{intake.phone ? <div><dt className="text-xs font-semibold text-black/35">Phone</dt><dd className="mt-1 text-black/68">{intake.phone}</dd></div> : null}{property ? <><div><dt className="text-xs font-semibold text-black/35">Linked property</dt><dd className="mt-1"><Link href={`/admin/properties/${property.id}`} className="font-semibold text-[#765a29] hover:underline">{property.name}</Link></dd></div><div><dt className="text-xs font-semibold text-black/35">Property health</dt><dd className="mt-2"><StatusBadge value={property.health_status} /></dd></div></> : <div className="border-l-2 border-[#a8864e] pl-3 text-xs leading-5 text-black/42">This intake is not yet linked to a property record.</div>}</dl>
        {["completed", "published"].includes(assessment.status) ? <div className="mt-6 flex items-start gap-3 border-t border-black/10 pt-5"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 text-[#607568]" /><p className="text-xs leading-5 text-black/46">Assessment workflow complete.</p></div> : null}
      </aside>
    </div>
  </main>;
}
