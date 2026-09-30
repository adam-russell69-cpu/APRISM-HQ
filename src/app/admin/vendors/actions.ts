"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";

const statuses = new Set(["candidate","vetted","preferred","inactive"]);
const emergencyOptions = new Set(["unknown","none","after_hours","24_7"]);
const clientApprovalStatuses = new Set(["not_required","pending","approved","restricted"]);
const checkpoints = new Set(["intake","documentation","operational_review","vetted","preferred","rejected"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const field = (formData: FormData, name: string, max = 1000) =>
  String(formData.get(name) ?? "").trim().slice(0, max);
const optional = (formData: FormData, name: string, max = 1000) =>
  field(formData, name, max) || null;
const checked = (formData: FormData, name: string) => formData.get(name) === "on";
const dateOrNull = (formData: FormData, name: string) => {
  const value = field(formData, name, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
};
const actionMessage = (message: string) => encodeURIComponent(message);

export async function createVendor(formData: FormData) {
  const { supabase } = await requireStaff();

  const name = field(formData, "name", 180);
  const trade = field(formData, "trade", 120);
  const primaryContact = optional(formData, "primary_contact", 160);
  const email = optional(formData, "email", 254)?.toLowerCase() ?? null;
  const phone = optional(formData, "phone", 40);
  const coverageArea = field(formData, "coverage_area", 500);
  const emergencyAvailability = field(formData, "emergency_availability", 30);
  const standardRates = field(formData, "standard_rates", 500);
  const emergencyRates = optional(formData, "emergency_rates", 500);
  const status = field(formData, "status", 30);
  const approvalCheckpoint = field(formData, "approval_checkpoint", 40);
  const clientApprovalStatus = field(formData, "client_approval_status", 30);
  const serviceRequestMethod = field(formData, "service_request_method", 120);
  const serviceRequestProcess = field(formData, "service_request_process", 1200);
  const notes = optional(formData, "notes", 2000);

  const invalid =
    !name ||
    !trade ||
    !coverageArea ||
    !standardRates ||
    !serviceRequestMethod ||
    !serviceRequestProcess ||
    !statuses.has(status) ||
    !emergencyOptions.has(emergencyAvailability) ||
    !checkpoints.has(approvalCheckpoint) ||
    !clientApprovalStatuses.has(clientApprovalStatus) ||
    (email && !emailPattern.test(email));

  if (invalid) {
    redirect(`/admin/vendors/new?error=${actionMessage("Review the required vendor details and submit again.")}`);
  }

  const { data, error } = await supabase.from("vendors").insert({
    name,
    trade,
    primary_contact: primaryContact,
    email,
    phone,
    coverage_area: coverageArea,
    emergency_availability: emergencyAvailability,
    standard_rates: standardRates,
    emergency_rates: emergencyRates,
    license_required: checked(formData, "license_required"),
    license_verified: checked(formData, "license_verified"),
    license_number: optional(formData, "license_number", 120),
    license_expires_on: dateOrNull(formData, "license_expires_on"),
    insurance_verified: checked(formData, "insurance_verified"),
    insurance_expires_on: dateOrNull(formData, "insurance_expires_on"),
    w9_received: checked(formData, "w9_received"),
    w9_received_on: dateOrNull(formData, "w9_received_on"),
    client_approval_required: checked(formData, "client_approval_required"),
    client_approval_status: clientApprovalStatus,
    service_request_method: serviceRequestMethod,
    service_request_process: serviceRequestProcess,
    approval_checkpoint: approvalCheckpoint,
    status,
    notes,
  }).select("id").single();

  if (error || !data?.id) {
    console.error("APRISM vendor create failed", { code: error?.code ?? "missing_vendor_id" });
    redirect(`/admin/vendors/new?error=${actionMessage("The vendor could not be created. No record was added.")}`);
  }

  revalidatePath("/admin/vendors");
  redirect(`/admin/vendors/${data.id}?notice=${actionMessage("Vendor intake created.")}`);
}
