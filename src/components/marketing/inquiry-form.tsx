"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useActionState } from "react";
import { submitInquiry, type InquiryState } from "@/app/(marketing)/contact/actions";

const initialState: InquiryState = { status: "idle", message: "" };
const serviceOptions = ["Property Services", "Estate Management", "Home Watch", "New Home Stewardship", "APRISM Moto"];

const inputClass = "mt-2 min-h-12 w-full border border-black/18 bg-white/45 px-4 text-sm text-black outline-none transition placeholder:text-black/32 focus:border-[#8f713d] focus:bg-white/75";
const labelClass = "text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-black/58";

export function InquiryForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);

  return (
    <form action={formAction} className="border border-black/12 bg-[#f7f5ee] p-5 sm:p-8" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className={labelClass}>Name<input className={inputClass} type="text" name="name" autoComplete="name" required /></label>
        <label className={labelClass}>Email<input className={inputClass} type="email" name="email" autoComplete="email" required /></label>
        <label className={labelClass}>Phone<input className={inputClass} type="tel" name="phone" autoComplete="tel" required /></label>
        <label className={labelClass}>Property location<input className={inputClass} type="text" name="propertyLocation" autoComplete="street-address" placeholder="Neighborhood or address" required /></label>
        <label className={labelClass}>Property type<select className={inputClass} name="propertyType" defaultValue="" required><option value="" disabled>Select property type</option><option>Single-family residence</option><option>Condominium / townhome</option><option>Estate / compound</option><option>Multiple properties</option><option>Specialty asset collection</option></select></label>
        <label className={labelClass}>Approximate home size<select className={inputClass} name="homeSize" defaultValue="" required><option value="" disabled>Select range</option><option>Under 3,000 sq. ft.</option><option>3,000–5,000 sq. ft.</option><option>5,000–8,000 sq. ft.</option><option>8,000–12,000 sq. ft.</option><option>12,000+ sq. ft.</option></select></label>
      </div>

      <fieldset className="mt-7 border-t border-black/12 pt-7">
        <legend className={labelClass}>How is this property used?</legend>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-8">
          {["Primary residence", "Second home"].map((option) => <label key={option} className="flex cursor-pointer items-center gap-3 text-sm text-black/65"><input type="radio" name="residency" value={option} className="size-4 accent-[#8f713d]" required />{option}</label>)}
        </div>
      </fieldset>

      <fieldset className="mt-7 border-t border-black/12 pt-7">
        <legend className={labelClass}>Services of interest</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {serviceOptions.map((option) => <label key={option} className="flex cursor-pointer items-center gap-3 text-sm text-black/65"><input type="checkbox" name="services" value={option} className="size-4 accent-[#8f713d]" />{option}</label>)}
        </div>
      </fieldset>

      <div className="mt-7 grid gap-6 border-t border-black/12 pt-7 sm:grid-cols-2">
        <label className={labelClass}>Preferred contact method<select className={inputClass} name="preferredContact" defaultValue="" required><option value="" disabled>Select preference</option><option>Email</option><option>Phone</option><option>Text message</option></select></label>
        <label className={labelClass}>Best time to reach you<input className={inputClass} type="text" name="preferredTime" placeholder="Optional" /></label>
      </div>

      <label className={`${labelClass} mt-7 block`}>Tell us about the property and your priorities<textarea className={`${inputClass} min-h-36 resize-y py-4`} name="message" required /></label>

      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-lg text-xs leading-5 text-black/42">Your information is used only to understand the property and respond to this request.</p>
        <button type="submit" disabled={pending} className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 bg-[#171a19] px-7 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#8f713d] disabled:cursor-wait disabled:opacity-60">{pending ? "Preparing request…" : "Request Property Assessment"}<ArrowRight aria-hidden="true" className="size-4" /></button>
      </div>

      {state.message ? <div role="status" aria-live="polite" className={`mt-6 flex gap-3 border p-4 text-sm leading-6 ${state.status === "success" ? "border-[#758b70]/35 bg-[#758b70]/10 text-[#3f583b]" : "border-[#a95b54]/35 bg-[#a95b54]/10 text-[#7a3732]"}`}>{state.status === "success" ? <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" /> : null}<p>{state.message}</p></div> : null}
    </form>
  );
}
