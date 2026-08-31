"use client";

import { useActionState } from "react";
import { Download, LockKeyhole } from "lucide-react";
import { submitAssessmentIntake, type IntakeState } from "@/app/(marketing)/property-assessment/intake/actions";
import { assessmentDisclaimer, intakeSections, type AssessmentField } from "@/lib/assessment-config";

const initialState: IntakeState = { status: "idle", message: "" };
const fieldClass = "mt-2 min-h-12 w-full border border-black/15 bg-white/70 px-4 text-sm text-[#171a19] placeholder:text-black/28 focus:border-[#9b7b45] focus:outline-none";

function IntakeField({ field }: { field: AssessmentField }) {
  if (field.type === "checkbox") {
    return <label className="flex items-start gap-3 border border-black/10 bg-white/45 p-4 text-xs leading-6 text-black/62"><input className="mt-1 size-4 accent-[#8f713d]" type="checkbox" name={field.name} required={field.required} /><span>{field.label}{field.required ? " *" : ""}</span></label>;
  }

  if (field.type === "textarea") {
    return <label className="block text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-black/52 sm:col-span-2">{field.label}{field.required ? " *" : ""}<textarea className={`${fieldClass} min-h-28 resize-y py-3 normal-case tracking-normal`} name={field.name} required={field.required} maxLength={5000} placeholder={field.placeholder} /></label>;
  }

  if (field.type === "select") {
    return <label className="block text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-black/52">{field.label}{field.required ? " *" : ""}<select className={fieldClass} name={field.name} required={field.required} defaultValue=""><option value="" disabled>Select one</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
  }

  return <label className="block text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-black/52">{field.label}{field.required ? " *" : ""}<input className={fieldClass} name={field.name} type={field.type ?? "text"} required={field.required} maxLength={field.type === "number" || field.type === "date" ? undefined : 5000} placeholder={field.placeholder} /></label>;
}

export function AssessmentIntakeForm() {
  const [state, formAction, pending] = useActionState(submitAssessmentIntake, initialState);

  if (state.status === "success") {
    return <div className="border border-[#c7a76b]/35 bg-[#111514] px-6 py-14 text-center text-white sm:px-10"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#d3b67b]">Intake received</p><h2 className="mt-5 font-serif text-4xl">Thank you for the context.</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/55">{state.message}</p></div>;
  }

  return <form action={formAction} className="space-y-5">
    <div className="pointer-events-none absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true"><label htmlFor="aprism-check-47">Leave this field blank</label><input id="aprism-check-47" name="aprism_check_47" tabIndex={-1} autoComplete="off" aria-hidden="true" /></div>
    {intakeSections.map((section) => <fieldset key={section.eyebrow} className="border border-black/12 bg-[#f7f4ed] p-5 sm:p-8">
      <legend className="sr-only">{section.title}</legend>
      <div className="grid gap-5 lg:grid-cols-[0.28fr_0.72fr]">
        <div><p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#8f713d]">{section.eyebrow}</p><h2 className="mt-3 font-serif text-3xl leading-tight">{section.title}</h2><p className="mt-3 text-xs leading-6 text-black/45">{section.description}</p></div>
        <div className="grid gap-4 sm:grid-cols-2">{section.fields.map((field) => <IntakeField key={field.name} field={field} />)}</div>
      </div>
    </fieldset>)}

    <div className="border border-black/12 bg-[#171b19] p-6 text-white sm:p-8">
      <div className="flex items-start gap-4"><LockKeyhole aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#c7a76b]" /><div><p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#d2b579]">Private property information</p><p className="mt-3 text-xs leading-6 text-white/48">{assessmentDisclaimer}</p></div></div>
      {state.status === "error" ? <p className="mt-5 border border-[#b96b63]/45 bg-[#b96b63]/10 p-4 text-sm text-[#f2c0ba]" role="alert">{state.message}</p> : null}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button disabled={pending} type="submit" className="min-h-14 bg-[#c7a76b] px-7 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#101211] transition hover:bg-[#dec188] disabled:cursor-wait disabled:opacity-60">{pending ? "Submitting securely..." : "Submit property intake"}</button>
        <a href="/documents/assessments/APRISM_Property_Assessment_Intake_Fillable.pdf" download className="inline-flex min-h-12 items-center justify-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/58 hover:text-white"><Download aria-hidden="true" className="size-4" />Download fillable PDF</a>
      </div>
    </div>
  </form>;
}
