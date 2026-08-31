import { ClipboardCheck, FileText } from "lucide-react";
import { AssessmentReportTool, FieldAssessmentTool } from "@/components/admin/assessment-tools";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { requireStaff } from "@/lib/admin-account";

const statusLabel = (value: string) => value.replaceAll("_", " ");
const submissionDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Denver",
});
const formatSubmissionDate = (value: string) => submissionDateFormatter.format(new Date(value));

type IntakeSummary = {
  email?: string;
  owner_name?: string;
  property_address?: string;
  property_name?: string;
};

export default async function AdminAssessmentsPage() {
  const { supabase } = await requireStaff();
  const [propertyResult, inquiryResult, intakeResult, assessmentResult] = await Promise.all([
    supabase.from("properties").select("id, name, city").order("name"),
    supabase.from("inquiries").select("id, name, property_location").order("created_at", { ascending: false }).limit(50),
    supabase.from("property_assessments").select("id, status, intake_data, created_at").eq("status", "intake_received").order("created_at", { ascending: false }).limit(12),
    supabase.from("property_assessments").select("id, status, assessment_date, intake_data, created_at").order("created_at", { ascending: false }).limit(12),
  ]);

  const properties = (propertyResult.data ?? []).map((property) => ({ id: property.id, label: `${property.name} · ${property.city}` }));
  const inquiries = (inquiryResult.data ?? []).map((inquiry) => ({ id: inquiry.id, label: `${inquiry.name} · ${inquiry.property_location}` }));
  const intakes = intakeResult.data ?? [];
  const assessments = assessmentResult.data ?? [];

  return <main className="mx-auto max-w-[1560px] px-5 py-8 sm:px-8 lg:px-10 lg:py-11">
    <div className="print-hidden"><PortalPageHeader eyebrow="Property stewardship" title="Property Assessments" description="Move from client intake to observable-condition field work, a documented baseline, and a clear stewardship recommendation." /></div>

    <section className="print-hidden mt-7 border border-black/10 bg-white">
      <div className="flex flex-col gap-2 border-b border-black/10 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#80632d]">Newest client intakes</p><h2 className="mt-2 font-serif text-2xl">Intake received</h2></div>
        <p className="text-xs text-black/42">Newest submissions appear first.</p>
      </div>
      {intakes.length ? <div>
        <div className="hidden grid-cols-[1fr_1.4fr_1.15fr_0.8fr_0.65fr] gap-4 border-b border-black/10 bg-[#f7f4ed] px-5 py-3 text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-black/42 md:grid"><span>Owner</span><span>Property</span><span>Email</span><span>Submitted</span><span>Status</span></div>
        <div className="divide-y divide-black/10">{intakes.map((assessment) => { const intake = assessment.intake_data as IntakeSummary | null; return <article key={assessment.id} className="grid gap-3 px-5 py-5 text-sm md:grid-cols-[1fr_1.4fr_1.15fr_0.8fr_0.65fr] md:items-center md:gap-4">
          <div><span className="text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-black/38 md:hidden">Owner<br /></span><span className="font-medium text-black/75">{intake?.owner_name || "Not provided"}</span></div>
          <div><span className="text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-black/38 md:hidden">Property<br /></span><span className="text-black/62">{intake?.property_address || intake?.property_name || "Not provided"}</span></div>
          <div className="min-w-0"><span className="text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-black/38 md:hidden">Email<br /></span><span className="break-words text-black/62">{intake?.email || "Not provided"}</span></div>
          <div><span className="text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-black/38 md:hidden">Submitted<br /></span><span className="text-xs text-black/48">{formatSubmissionDate(assessment.created_at)}</span></div>
          <div><span className="inline-flex border border-[#a8864e]/30 bg-[#a8864e]/8 px-2.5 py-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-[#745a2b]">{statusLabel(assessment.status)}</span></div>
        </article>; })}</div>
      </div> : <p className="px-5 py-7 text-sm text-black/45">No intake_received records yet.</p>}
    </section>

    <section className="print-hidden mt-7 grid gap-4 lg:grid-cols-2">
      <a href="#field-checklist" className="flex items-start gap-4 border border-black/10 bg-white p-5 transition hover:border-[#a8864e]/55"><ClipboardCheck aria-hidden="true" className="mt-1 size-5 text-[#8f713d]" /><div><p className="font-serif text-2xl">Field Assessment Checklist</p><p className="mt-2 text-xs leading-6 text-black/46">Capture ratings, notes, priorities, and photo references on site.</p></div></a>
      <a href="#assessment-report" className="flex items-start gap-4 border border-black/10 bg-white p-5 transition hover:border-[#a8864e]/55"><FileText aria-hidden="true" className="mt-1 size-5 text-[#8f713d]" /><div><p className="font-serif text-2xl">Property Assessment Report</p><p className="mt-2 text-xs leading-6 text-black/46">Prepare the client-facing baseline and stewardship care plan.</p></div></a>
    </section>

    {assessments.length ? <section className="print-hidden mt-6 border border-black/10 bg-white"><div className="border-b border-black/10 px-5 py-4"><p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#80632d]">Recent assessment records</p></div><div className="grid divide-y divide-black/10 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">{assessments.slice(0, 4).map((assessment) => { const intake = assessment.intake_data as { property_label?: string; property_name?: string } | null; return <article key={assessment.id} className="p-5"><p className="font-serif text-xl">{intake?.property_label || intake?.property_name || "Property intake"}</p><p className="mt-2 text-[0.54rem] font-semibold uppercase tracking-[0.14em] text-[#80632d]">{statusLabel(assessment.status)}</p><p className="mt-2 text-xs text-black/40">{assessment.assessment_date || new Date(assessment.created_at).toLocaleDateString("en-US")}</p></article>; })}</div></section> : null}

    <section id="field-checklist" className="mt-7 scroll-mt-8"><FieldAssessmentTool properties={properties} inquiries={inquiries} /></section>
    <section id="assessment-report" className="mt-7 scroll-mt-8"><AssessmentReportTool properties={properties} inquiries={inquiries} /></section>
  </main>;
}
