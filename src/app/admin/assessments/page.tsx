import { ClipboardCheck, FileText } from "lucide-react";
import { AssessmentReportTool, FieldAssessmentTool } from "@/components/admin/assessment-tools";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { requireStaff } from "@/lib/admin-account";

const statusLabel = (value: string) => value.replaceAll("_", " ");

export default async function AdminAssessmentsPage() {
  const { supabase } = await requireStaff();
  const [propertyResult, inquiryResult, assessmentResult] = await Promise.all([
    supabase.from("properties").select("id, name, city").order("name"),
    supabase.from("inquiries").select("id, name, property_location").order("created_at", { ascending: false }).limit(50),
    supabase.from("property_assessments").select("id, status, assessment_date, intake_data, created_at").order("created_at", { ascending: false }).limit(12),
  ]);

  const properties = (propertyResult.data ?? []).map((property) => ({ id: property.id, label: `${property.name} · ${property.city}` }));
  const inquiries = (inquiryResult.data ?? []).map((inquiry) => ({ id: inquiry.id, label: `${inquiry.name} · ${inquiry.property_location}` }));
  const assessments = assessmentResult.data ?? [];

  return <main className="mx-auto max-w-[1560px] px-5 py-8 sm:px-8 lg:px-10 lg:py-11">
    <div className="print-hidden"><PortalPageHeader eyebrow="Property stewardship" title="Property Assessments" description="Move from client intake to observable-condition field work, a documented baseline, and a clear stewardship recommendation." /></div>

    <section className="print-hidden mt-7 grid gap-4 lg:grid-cols-2">
      <a href="#field-checklist" className="flex items-start gap-4 border border-black/10 bg-white p-5 transition hover:border-[#a8864e]/55"><ClipboardCheck aria-hidden="true" className="mt-1 size-5 text-[#8f713d]" /><div><p className="font-serif text-2xl">Field Assessment Checklist</p><p className="mt-2 text-xs leading-6 text-black/46">Capture ratings, notes, priorities, and photo references on site.</p></div></a>
      <a href="#assessment-report" className="flex items-start gap-4 border border-black/10 bg-white p-5 transition hover:border-[#a8864e]/55"><FileText aria-hidden="true" className="mt-1 size-5 text-[#8f713d]" /><div><p className="font-serif text-2xl">Property Assessment Report</p><p className="mt-2 text-xs leading-6 text-black/46">Prepare the client-facing baseline and stewardship care plan.</p></div></a>
    </section>

    {assessments.length ? <section className="print-hidden mt-6 border border-black/10 bg-white"><div className="border-b border-black/10 px-5 py-4"><p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#80632d]">Recent assessment records</p></div><div className="grid divide-y divide-black/10 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">{assessments.slice(0, 4).map((assessment) => { const intake = assessment.intake_data as { property_label?: string; property_name?: string } | null; return <article key={assessment.id} className="p-5"><p className="font-serif text-xl">{intake?.property_label || intake?.property_name || "Property intake"}</p><p className="mt-2 text-[0.54rem] font-semibold uppercase tracking-[0.14em] text-[#80632d]">{statusLabel(assessment.status)}</p><p className="mt-2 text-xs text-black/40">{assessment.assessment_date || new Date(assessment.created_at).toLocaleDateString("en-US")}</p></article>; })}</div></section> : null}

    <section id="field-checklist" className="mt-7 scroll-mt-8"><FieldAssessmentTool properties={properties} inquiries={inquiries} /></section>
    <section id="assessment-report" className="mt-7 scroll-mt-8"><AssessmentReportTool properties={properties} inquiries={inquiries} /></section>
  </main>;
}
