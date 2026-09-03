"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { submitServiceRequest, type RequestState } from "@/app/portal/(dashboard)/requests/actions";
import type { PortalProperty } from "@/lib/portal-data";

const initialState: RequestState = { status: "idle", message: "" };
const fieldClass = "mt-2 min-h-12 w-full border border-black/14 bg-white px-4 text-sm outline-none focus:border-[#8c6f3c]";
const labelClass = "text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-black/45";

export function RequestForm({ properties }: { properties: Pick<PortalProperty, "id" | "name">[] }) {
  const [state, formAction, pending] = useActionState(submitServiceRequest, initialState);
  const defaultPropertyId = properties[0]?.id ?? "";
  return <form action={formAction} className="grid gap-6 p-5 sm:p-6"><label className={labelClass}>Property<select name="propertyId" className={fieldClass} required defaultValue={defaultPropertyId}>{properties.length > 1 ? <option value="" disabled>Select property</option> : null}{properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select></label><div className="grid gap-6 sm:grid-cols-2"><label className={labelClass}>Request title<input name="title" className={fieldClass} required maxLength={120} placeholder="What needs attention?" /></label><label className={labelClass}>Category<select name="category" className={fieldClass} required defaultValue=""><option value="" disabled>Select category</option><option>Maintenance</option><option>Repair / troubleshooting</option><option>Arrival preparation</option><option>Vendor coordination</option><option>Other</option></select></label></div><label className={labelClass}>Preferred timing<input name="preferredTiming" className={fieldClass} maxLength={250} placeholder="Date range or priority" /></label><label className={labelClass}>Details<textarea name="description" className={`${fieldClass} min-h-36 resize-y py-4`} required maxLength={5000} placeholder="Include access notes, observations, or context." /></label><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-black/40">APRISM will review, confirm scope, and coordinate the next step.</p><button type="submit" disabled={pending || !properties.length} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#1a1d1c] px-6 text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-60">{pending ? "Sending…" : "Submit request"}<Send aria-hidden="true" className="size-4" /></button></div>{state.message ? <p role="status" className={`border p-4 text-xs leading-5 ${state.status === "success" ? "border-[#75917a]/30 bg-[#75917a]/10 text-[#446349]" : "border-[#a5534d]/30 bg-[#a5534d]/10 text-[#7d332f]"}`}>{state.message}</p> : null}</form>;
}
