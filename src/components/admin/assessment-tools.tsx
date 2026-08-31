"use client";

import { useActionState } from "react";
import { Download, Printer } from "lucide-react";
import { saveAssessmentReport, saveFieldAssessment, type AssessmentAdminState } from "@/app/admin/assessments/actions";
import { assessmentAreaKey, assessmentDisclaimer, fieldAssessmentAreas, findingStatuses, reportFields } from "@/lib/assessment-config";

type Option = { id: string; label: string };
type AssessmentToolsProps = { properties: Option[]; inquiries: Option[] };
const initialState: AssessmentAdminState = { status: "idle", message: "" };
const inputClass = "mt-2 min-h-11 w-full border border-black/15 bg-white px-3 text-sm text-[#171a19] focus:border-[#8f713d] focus:outline-none";

function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="print-hidden inline-flex min-h-11 items-center justify-center gap-2 border border-black/18 px-4 text-[0.56rem] font-semibold uppercase tracking-[0.14em]"><Printer aria-hidden="true" className="size-4" />Print / Save PDF</button>;
}

function RecordIdentity({ properties, inquiries }: AssessmentToolsProps) {
  return <div className="grid gap-4 border-b border-black/10 pb-6 sm:grid-cols-2 lg:grid-cols-4">
    <label className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-black/52">Property record<select className={inputClass} name="property_id" defaultValue=""><option value="">Not yet linked</option>{properties.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
    <label className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-black/52">Inquiry record<select className={inputClass} name="inquiry_id" defaultValue=""><option value="">Not linked</option>{inquiries.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
    <label className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-black/52">Client name<input className={inputClass} name="client_name" maxLength={240} /></label>
    <label className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-black/52">Assessment date<input className={inputClass} name="assessment_date" type="date" required /></label>
    <label className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-black/52 sm:col-span-2 lg:col-span-4">Property / residence<input className={inputClass} name="property_label" maxLength={240} required /></label>
  </div>;
}

export function FieldAssessmentTool(props: AssessmentToolsProps) {
  const [state, action, pending] = useActionState(saveFieldAssessment, initialState);
  return <form action={action} className="assessment-print-sheet bg-[#f8f6f0] p-5 sm:p-8">
    <div className="flex flex-col gap-5 border-b border-black/12 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#866731]">Field Assessment Checklist</p><h2 className="mt-3 font-serif text-4xl">Observable-condition baseline</h2><p className="mt-3 max-w-2xl text-xs leading-6 text-black/48">Record a status and concise field note for each assessment area. Reference photo numbers where they support a finding.</p></div><PrintButton /></div>
    <div className="mt-6"><RecordIdentity {...props} /></div>
    <div className="mt-6 divide-y divide-black/10 border-y border-black/10">{fieldAssessmentAreas.map((area, index) => {
      const key = assessmentAreaKey(area);
      return <div key={area} className="grid gap-4 py-5 lg:grid-cols-[0.44fr_0.2fr_0.9fr]"><div><span className="text-[0.54rem] font-semibold uppercase tracking-[0.16em] text-[#8f713d]">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-1 font-serif text-xl">{area}</h3></div><label className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-black/45">Finding<select className={inputClass} name={`${key}_status`} defaultValue="Good">{findingStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-black/45">Notes / photo references<textarea className={`${inputClass} min-h-20 resize-y py-3 normal-case tracking-normal`} name={`${key}_notes`} maxLength={8000} /></label></div>;
    })}</div>
    <label className="mt-6 block text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-black/48">General field notes<textarea className={`${inputClass} min-h-28 resize-y py-3 normal-case tracking-normal`} name="general_notes" maxLength={8000} /></label>
    <p className="mt-6 border-l-2 border-[#a8864e] pl-4 text-[0.68rem] leading-6 text-black/48">{assessmentDisclaimer}</p>
    <div className="print-hidden mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"><button disabled={pending} type="submit" className="min-h-12 bg-[#171b19] px-6 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60">{pending ? "Saving..." : "Save checklist draft"}</button><a href="/admin/assessments/documents/APRISM_Field_Assessment_Checklist.pdf" className="inline-flex min-h-12 items-center justify-center gap-2 border border-black/15 px-5 text-[0.56rem] font-semibold uppercase tracking-[0.13em]"><Download aria-hidden="true" className="size-4" />Reference PDF</a>{state.message ? <p className={`text-xs ${state.status === "error" ? "text-[#9b4f49]" : "text-[#4e704e]"}`} role="status">{state.message}</p> : null}</div>
  </form>;
}

export function AssessmentReportTool(props: AssessmentToolsProps) {
  const [state, action, pending] = useActionState(saveAssessmentReport, initialState);
  return <form action={action} className="assessment-print-sheet bg-[#f8f6f0] p-5 sm:p-8">
    <div className="flex flex-col gap-5 border-b border-black/12 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#866731]">Property Assessment Report</p><h2 className="mt-3 font-serif text-4xl">Stewardship baseline & care plan</h2><p className="mt-3 max-w-2xl text-xs leading-6 text-black/48">Translate field observations into a clear client record, prioritized plan, and stewardship recommendation.</p></div><PrintButton /></div>
    <div className="mt-6"><RecordIdentity {...props} /></div>
    <div className="mt-6 grid gap-5">{reportFields.map(([name, label], index) => <label key={name} className="block text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-black/48"><span className="mr-3 text-[#8f713d]">{String(index + 1).padStart(2, "0")}</span>{label}<textarea className={`${inputClass} min-h-28 resize-y py-3 normal-case tracking-normal`} name={name} maxLength={8000} /></label>)}</div>
    <p className="mt-6 border-l-2 border-[#a8864e] pl-4 text-[0.68rem] leading-6 text-black/48">{assessmentDisclaimer}</p>
    <div className="print-hidden mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"><button disabled={pending} type="submit" className="min-h-12 bg-[#171b19] px-6 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60">{pending ? "Saving..." : "Save report draft"}</button><a href="/admin/assessments/documents/APRISM_Property_Assessment_Report_Template_Fillable.pdf" className="inline-flex min-h-12 items-center justify-center gap-2 border border-black/15 px-5 text-[0.56rem] font-semibold uppercase tracking-[0.13em]"><Download aria-hidden="true" className="size-4" />Reference PDF</a>{state.message ? <p className={`text-xs ${state.status === "error" ? "text-[#9b4f49]" : "text-[#4e704e]"}`} role="status">{state.message}</p> : null}</div>
  </form>;
}
