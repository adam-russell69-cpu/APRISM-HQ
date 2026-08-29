"use server";

import { createClient } from "@/lib/supabase/server";

export type InquiryState = {
  status: "idle" | "error" | "success";
  message: string;
  analytics?: {
    lead_type: "property_assessment";
    service_interest: string;
  };
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const allowedPropertyTypes = new Set([
  "Single-family residence",
  "Condominium / townhome",
  "Estate / compound",
  "Multiple properties",
  "Specialty asset collection",
]);
const allowedResidencies = new Set(["Primary residence", "Second home"]);
const allowedHomeSizes = new Set([
  "Under 3,000 sq. ft.",
  "3,000–5,000 sq. ft.",
  "5,000–8,000 sq. ft.",
  "8,000–12,000 sq. ft.",
  "12,000+ sq. ft.",
]);
const allowedServices = new Set(["Property Services", "Estate Management", "Home Watch", "New Home Stewardship", "APRISM Moto"]);
const allowedContactMethods = new Set(["Email", "Phone", "Text message"]);

function value(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

export async function submitInquiry(
  _previousState: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  if (value(formData, "companyWebsite")) {
    return { status: "success", message: "Thank you. Your request has been received." };
  }

  const inquiry = {
    name: value(formData, "name"),
    email: value(formData, "email").toLowerCase(),
    phone: value(formData, "phone"),
    property_location: value(formData, "propertyLocation"),
    property_type: value(formData, "propertyType"),
    residency: value(formData, "residency"),
    home_size: value(formData, "homeSize"),
    services: [...new Set(formData.getAll("services").map((service) => String(service).trim()))],
    preferred_contact_method: value(formData, "preferredContact"),
    preferred_time: value(formData, "preferredTime") || null,
    message: value(formData, "message"),
  };

  const missing = Object.entries(inquiry).some(([field, fieldValue]) => {
    if (field === "preferred_time") return false;
    return Array.isArray(fieldValue) ? fieldValue.length === 0 : !fieldValue;
  });

  if (missing) {
    return { status: "error", message: "Please complete each required field and select at least one service." };
  }

  if (!emailPattern.test(inquiry.email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const invalidSelection =
    !allowedPropertyTypes.has(inquiry.property_type)
    || !allowedResidencies.has(inquiry.residency)
    || !allowedHomeSizes.has(inquiry.home_size)
    || !allowedContactMethods.has(inquiry.preferred_contact_method)
    || inquiry.services.some((service) => !allowedServices.has(service));

  if (invalidSelection || inquiry.name.length > 120 || inquiry.phone.length > 40 || inquiry.property_location.length > 240 || inquiry.message.length < 10 || inquiry.message.length > 4000 || (inquiry.preferred_time?.length ?? 0) > 120) {
    return { status: "error", message: "Please review the form details and try again." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "error", message: "We could not receive your request right now. Please try again shortly." };
  }

  const { error } = await supabase.from("inquiries").insert(inquiry);
  if (error) {
    console.error("APRISM inquiry submission failed", { code: error.code });
    return { status: "error", message: "We could not receive your request right now. Please try again shortly." };
  }

  return {
    status: "success",
    message: "Thank you. Your request has been received. APRISM will respond within one business day.",
    analytics: {
      lead_type: "property_assessment",
      service_interest: inquiry.services.join("|"),
    },
  };
}
