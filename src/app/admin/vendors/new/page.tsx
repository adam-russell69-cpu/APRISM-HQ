import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createVendor } from "../actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/lib/admin-account";

export const metadata: Metadata = { title: "New Vendor" };

const inputClass = "mt-2 min-h-11 w-full border border-black/15 bg-white px-3.5 text-sm outline-none focus:border-[#8f713d]";
const textareaClass = `${inputClass} min-h-28 py-3`;
const sectionClass = "border-t border-black/10 pt-5";
const checkboxClass = "size-4 accent-[#8f713d]";

export default async function NewVendorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireStaff();
  const { error } = await searchParams;

  return <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <Link href="/admin/vendors" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black">
      <ChevronLeft aria-hidden="true" className="size-4" />All vendors
    </Link>

    <AdminPageHeader
      eyebrow="Vendor onboarding"
      title="New Vendor Intake"
      description="Capture the information APRISM needs to move a service provider from Candidate to Vetted to Preferred."
    />

    {error ? <p role="alert" className="mt-5 border border-[#83524d]/30 bg-[#83524d]/10 px-4 py-3 text-sm text-[#71413d]">{error}</p> : null}

    <form action={createVendor} className="mt-6 space-y-6 border border-black/10 bg-[#f8f6f0] p-5 sm:p-7">
      <section>
        <h2 className="font-serif text-2xl">Business identity</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-black/55">Business name *<input name="name" required maxLength={180} className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Trade / category *<input name="trade" required maxLength={120} className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Primary contact<input name="primary_contact" maxLength={160} className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Email<input name="email" type="email" maxLength={254} className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Phone<input name="phone" type="tel" maxLength={40} className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Coverage area *<input name="coverage_area" required maxLength={500} placeholder="Park City, Heber, Midway, Kamas, Oakley..." className={inputClass} /></label>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="font-serif text-2xl">Availability & rates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-black/55">Emergency availability *
            <select name="emergency_availability" defaultValue="unknown" className={inputClass} required>
              <option value="unknown">Unknown / not confirmed</option>
              <option value="none">No emergency service</option>
              <option value="after_hours">After-hours available</option>
              <option value="24_7">24/7 emergency service</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-black/55">Standard rates / service-call terms *<input name="standard_rates" required maxLength={500} placeholder="$___/hr, minimum, trip charge..." className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Emergency / after-hours rates<input name="emergency_rates" maxLength={500} className={inputClass} /></label>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="font-serif text-2xl">Compliance documents</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm text-black/65"><input name="license_required" type="checkbox" className={checkboxClass} />Trade license required</label>
            <label className="flex items-center gap-3 text-sm text-black/65"><input name="license_verified" type="checkbox" className={checkboxClass} />License verified</label>
            <label className="text-xs font-semibold text-black/55">License number<input name="license_number" maxLength={120} className={inputClass} /></label>
            <label className="text-xs font-semibold text-black/55">License expiration<input name="license_expires_on" type="date" className={inputClass} /></label>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm text-black/65"><input name="insurance_verified" type="checkbox" className={checkboxClass} />Insurance / COI verified</label>
            <label className="text-xs font-semibold text-black/55">Insurance expiration<input name="insurance_expires_on" type="date" className={inputClass} /></label>
            <label className="flex items-center gap-3 text-sm text-black/65"><input name="w9_received" type="checkbox" className={checkboxClass} />W-9 received</label>
            <label className="text-xs font-semibold text-black/55">W-9 received date<input name="w9_received_on" type="date" className={inputClass} /></label>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="font-serif text-2xl">Client approval & service process</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 text-sm text-black/65 sm:col-span-2"><input name="client_approval_required" type="checkbox" className={checkboxClass} />Property-specific client approval required before dispatch</label>
          <label className="text-xs font-semibold text-black/55">Client approval status *
            <select name="client_approval_status" defaultValue="not_required" className={inputClass} required>
              <option value="not_required">Not required</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="restricted">Restricted / client-specific</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-black/55">Preferred request channel *<input name="service_request_method" required maxLength={120} placeholder="Email, call, dispatch portal, text..." className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55 sm:col-span-2">Preferred service-request process *<textarea name="service_request_process" required maxLength={1200} placeholder="What APRISM should send, who to contact, photos/diagnostics required, scheduling expectations, escalation procedure..." className={textareaClass} /></label>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="font-serif text-2xl">Approval checkpoints</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-black/55">Vendor status *
            <select name="status" defaultValue="candidate" className={inputClass} required>
              <option value="candidate">Candidate</option>
              <option value="vetted">Vetted</option>
              <option value="preferred">Preferred</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-black/55">Approval checkpoint *
            <select name="approval_checkpoint" defaultValue="intake" className={inputClass} required>
              <option value="intake">1. Intake received</option>
              <option value="documentation">2. Documentation verified</option>
              <option value="operational_review">3. Operational review complete</option>
              <option value="vetted">4. Approved as vetted vendor</option>
              <option value="preferred">5. Approved as preferred vendor</option>
              <option value="rejected">Rejected / do not use</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-black/55 sm:col-span-2">Internal notes<textarea name="notes" maxLength={2000} className={textareaClass} /></label>
        </div>
      </section>

      <div className="flex justify-end border-t border-black/10 pt-5">
        <button type="submit" className="min-h-12 bg-[#171a19] px-6 text-xs font-semibold text-white">Create Vendor Intake</button>
      </div>
    </form>
  </main>;
}
