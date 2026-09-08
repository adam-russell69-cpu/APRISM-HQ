"use client";

import { useActionState } from "react";
import { ChevronDown, Download, Printer, Save } from "lucide-react";
import { saveAssessmentReport, saveFieldAssessment, type AssessmentAdminState } from "@/app/admin/assessments/actions";
import { assessmentAreaKey, assessmentDisclaimer, fieldAssessmentAreas, findingStatuses, reportFields } from "@/lib/assessment-config";

type Option = { id: string; label: string };
type Finding = { area: string; status?: string; notes?: string };
export type AssessmentDefaults = {
  id?: string;
  propertyId?: string | null;
  inquiryId?: string | null;
  clientName?: string;
  propertyLabel?: string;
  assessmentDate?: string | null;
  fieldNotes?: { general_notes?: string } | null;
  findings?: Finding[] | null;
  reportData?: Record<string, string> | null;
};
type AssessmentToolsProps = { properties: Option[]; inquiries: Option[]; defaults?: AssessmentDefaults };
const initialState: AssessmentAdminState = { status: "idle", message: "" };
const inputClass = "mt-2 min-h-11 w-full border border-black/15 bg-white px-3.5 text-sm text-[#171a19] focus:border-[#8f713d] focus:outline-none";

function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="print-hidden inline-flex min-h-11 items-center justify-center gap-2 border border-black/18 bg-white px-4 text-xs font-semibold text-black/65"><Printer aria-hidden="true" className="size-4" />Print / Save PDF</button>;
}

function RecordIdentity({ properties, inquiries, defaults }: AssessmentToolsProps) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {defaults?.id ? <input type="hidden" name="assessment_id" value={defaults.id} /> : null}
    <label className="text-xs font-semibold text-black/55">Property record<select className={inputClass} name="property_id" defaultValue={defaults?.propertyId ?? ""}><option value="">Not yet linked</option>{properties.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
    <label className="text-xs font-semibold text-black/55">Inquiry record<select className={inputClass} name="inquiry_id" defaultValue={defaults?.inquiryId ?? ""}><option value="">Not linked</option>{inquiries.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
    <label className="text-xs font-semibold text-black/55">Client name<input className={inputClass} name="client_name" defaultValue={defaults?.clientName ?? ""} maxLength={240} /></label>
    <label className="text-xs font-semibold text-black/55">Assessment date<input className={inputClass} name="assessment_date" type="date" defaultValue={defaults?.assessmentDate ?? ""} required /></label>
    <label className="text-xs font-semibold text-black/55 sm:col-span-2 xl:col-span-4">Property / residence<input className={inputClass} name="property_label" defaultValue={defaults?.propertyLabel ?? ""} maxLength={240} required /></label>
  </div>;
}

function SaveBar({ pending, state, label, pdfHref, completeAction }: { pending: boolean; state: AssessmentAdminState; label: string; pdfHref: string; completeAction?: React.ReactNode }) {
  return <div className="print-hidden sticky bottom-0 z-20 -mx-5 mt-7 flex flex-col gap-3 border-t border-black/12 bg-[#f8f6f0]/95 px-5 py-4 shadow-[0_-12px_28px_rgba(20,22,21,0.08)] backdrop-blur sm:-mx-7 sm:flex-row sm:items-center sm:px-7">
    <button disabled={pending} type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#171b19] px-6 text-xs font-semibold text-white disabled:opacity-60"><Save aria-hidden="true" className="size-4" />{pending ? "Saving..." : label}</button>
    {completeAction}
    <a href={pdfHref} className="inline-flex min-h-12 items-center justify-center gap-2 border border-black/15 bg-white px-5 text-xs font-semibold text-black/62"><Download aria-hidden="true" className="size-4" />Reference PDF</a>
    {state.message ? <p className={`text-sm sm:ml-auto ${state.status === "error" ? "text-[#8c4943]" : "text-[#4e704e]"}`} role="status">{state.message}</p> : <p className="text-xs text-black/35 sm:ml-auto">Changes save to this assessment record.</p>}
  </div>;
}

export function FieldAssessmentTool(props: AssessmentToolsProps) {
  const [state, action, pending] = useActionState(saveFieldAssessment, initialState);
  const findingMap = new Map((props.defaults?.findings ?? []).map((finding) => [finding.area, finding]));

  return <form action={action} className="assessment-print-sheet bg-[#f8f6f0] p-5 sm:p-7">
    <div className="flex flex-col gap-5 border-b border-black/12 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#866731]">Field Assessment</p><h2 className="mt-2 font-serif text-3xl sm:text-4xl">Observable-condition baseline</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-black/48">Open each property area as you walk the residence. Record only observable conditions, concise notes, and photo references.</p></div><PrintButton /></div>
    <div className="mt-6 border border-black/10 bg-white p-5"><RecordIdentity {...props} /></div>
    <div className="mt-5 space-y-2">{fieldAssessmentAreas.map((area, index) => {
      const key = assessmentAreaKey(area);
      const finding = findingMap.get(area);
      return <details key={area} className="group border border-black/10 bg-white" open={index === 0 || Boolean(finding?.notes)}><summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 px-4 [&::-webkit-details-marker]:hidden"><span className="text-xs font-semibold text-[#8f713d]">{String(index + 1).padStart(2, "0")}</span><h3 className="flex-1 font-serif text-xl">{area}</h3><span className="hidden text-xs text-black/38 sm:inline">{finding?.status ?? "Good"}</span><ChevronDown aria-hidden="true" className="size-4 text-black/30 transition group-open:rotate-180" /></summary><div className="grid gap-4 border-t border-black/10 bg-[#fbfaf7] p-4 lg:grid-cols-[0.28fr_0.72fr]"><label className="text-xs font-semibold text-black/50">Finding<select className={inputClass} name={`${key}_status`} defaultValue={finding?.status ?? "Good"}>{findingStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-xs font-semibold text-black/50">Notes / photo references<textarea className={`${inputClass} min-h-24 resize-y py-3 font-normal`} name={`${key}_notes`} defaultValue={finding?.notes ?? ""} maxLength={8000} /></label></div></details>;
    })}</div>
    <label className="mt-5 block border border-black/10 bg-white p-4 text-xs font-semibold text-black/50">General field notes<textarea className={`${inputClass} min-h-32 resize-y py-3 font-normal`} name="general_notes" defaultValue={props.defaults?.fieldNotes?.general_notes ?? ""} maxLength={8000} /></label>
    <p className="mt-6 border-l-2 border-[#a8864e] pl-4 text-xs leading-6 text-black/48">{assessmentDisclaimer}</p>
    <SaveBar pending={pending} state={state} label="Save Draft" pdfHref="/admin/assessments/documents/APRISM_Field_Assessment_Checklist.pdf" />
  </form>;
}

export function AssessmentReportTool(props: AssessmentToolsProps) {
  const [state, action, pending] = useActionState(saveAssessmentReport, initialState);
  return <form action={action} className="assessment-print-sheet bg-[#f8f6f0] p-5 sm:p-7">
    <div className="flex flex-col gap-5 border-b border-black/12 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#866731]">Property Assessment Report</p><h2 className="mt-2 font-serif text-3xl sm:text-4xl">Stewardship baseline & care plan</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-black/48">Translate field observations into a concise client record, prioritized plan, and stewardship recommendation.</p></div><PrintButton /></div>
    <div className="mt-6 border border-black/10 bg-white p-5"><RecordIdentity {...props} /></div>
    <div className="mt-5 grid gap-3">{reportFields.map(([name, label], index) => <label key={name} className="block border border-black/10 bg-white p-4 text-xs font-semibold text-black/50"><span className="mr-3 text-[#8f713d]">{String(index + 1).padStart(2, "0")}</span>{label}<textarea className={`${inputClass} min-h-28 resize-y py-3 font-normal`} name={name} defaultValue={props.defaults?.reportData?.[name] ?? ""} maxLength={8000} /></label>)}</div>
    <p className="mt-6 border-l-2 border-[#a8864e] pl-4 text-xs leading-6 text-black/48">{assessmentDisclaimer}</p>
    <SaveBar pending={pending} state={state} label="Save Report Draft" pdfHref="/admin/assessments/documents/APRISM_Property_Assessment_Report_Template_Fillable.pdf" />
  </form>;
}
