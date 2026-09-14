"use server";

import { createClient } from "@/lib/supabase/server";

export type InquiryState = { status: "idle" | "error" | "success"; message: string; analytics?: { lead_type: "property_assessment"; service_interest: string; source: string; }; };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedPropertyTypes = new Set(["Single-family residence", "Condominium / townhome", "Estate / compound", "Multiple properties", "Specialty asset collection"]);
const allowedResidencies = new Set(["Primary residence", "Second home"]);
const allowedHomeSizes = new Set(["Under 3,000 sq. ft.", "3,000–5,000 sq. ft.", "5,000–8,000 sq. ft.", "8,000–12,000 sq. ft.", "12,000+ sq. ft."]);
const allowedServices = new Set(["Property Assessment"]);
const allowedContactMethods = new Set(["Email", "Phone", "Text message"]);
const allowedSources = new Set(["website", "facebook", "nextdoor", "google", "referral", "other"]);
function value(formData: FormData, field: string) { return String(formData.get(field) ?? "").trim(); }

async function notifyAprismOfInquiry(inquiry: {
  name: string;
  email: string;
  phone: string;
  property_location: string;
  property_type: string;
  residency: string;
  home_size: string;
  preferred_contact_method: string;
  preferred_time: string | null;
  message: string;
  source: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("APRISM inquiry alert skipped", { reason: "RESEND_API_KEY missing" });
    return;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://aprismhq.com").replace(/\/$/, "");
  const text = [
    "New $295 Property Assessment request",
    "",
    `Source: ${inquiry.source}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone}`,
    `Property: ${inquiry.property_location}`,
    `Property type: ${inquiry.property_type}`,
    `Residence use: ${inquiry.residency}`,
    `Home size: ${inquiry.home_size}`,
    `Preferred contact: ${inquiry.preferred_contact_method}`,
    `Best time: ${inquiry.preferred_time || "Not specified"}`,
    "",
    "Client notes:",
    inquiry.message,
    "",
    `Open APRISM HQ: ${siteUrl}/admin/clients`,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "APRISM HQ <admin@aprismhq.com>",
        to: ["admin@aprismhq.com"],
        subject: `New $295 Property Assessment: ${inquiry.name}`,
        text,
      }),
    });

    if (!response.ok) {
      console.error("APRISM inquiry alert failed", { status: response.status });
    }
  } catch {
    console.error("APRISM inquiry alert failed", { status: "network_error" });
  }
}

export async function submitInquiry(_previousState: InquiryState, formData: FormData): Promise<InquiryState> {
  if (value(formData, "companyWebsite")) return { status: "success", message: "Thank you. Your request has been received." };
  const requestedSource = value(formData, "source").toLowerCase();
  const source = allowedSources.has(requestedSource) ? requestedSource : "website";
  const inquiry = {
    name: value(formData, "name"), email: value(formData, "email").toLowerCase(), phone: value(formData, "phone"),
    property_location: value(formData, "propertyLocation"), property_type: value(formData, "propertyType"), residency: value(formData, "residency"),
    home_size: value(formData, "homeSize"), services: [...new Set(formData.getAll("services").map((service) => String(service).trim()))],
    preferred_contact_method: value(formData, "preferredContact"), preferred_time: value(formData, "preferredTime") || null, message: value(formData, "message"), source,
  };
  if (inquiry.message.length < 10) return { status: "error", message: "Please tell us a little more about the property or your priorities." };
  const missing = Object.entries(inquiry).some(([field, fieldValue]) => field === "preferred_time" ? false : Array.isArray(fieldValue) ? fieldValue.length === 0 : !fieldValue);
  if (missing) return { status: "error", message: "Please complete each required field." };
  if (!emailPattern.test(inquiry.email)) return { status: "error", message: "Please enter a valid email address." };
  const invalidSelection = !allowedPropertyTypes.has(inquiry.property_type) || !allowedResidencies.has(inquiry.residency) || !allowedHomeSizes.has(inquiry.home_size) || !allowedContactMethods.has(inquiry.preferred_contact_method) || inquiry.services.some((service) => !allowedServices.has(service));
  if (invalidSelection || inquiry.name.length > 120 || inquiry.phone.length > 40 || inquiry.property_location.length > 240 || inquiry.message.length > 4000 || (inquiry.preferred_time?.length ?? 0) > 120) return { status: "error", message: "Please review the form details and try again." };
  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "We could not receive your request right now. Please try again shortly." };
  const { error } = await supabase.from("inquiries").insert(inquiry);
  if (error) { console.error("APRISM inquiry submission failed", { code: error.code }); return { status: "error", message: "We could not receive your request right now. Please try again shortly." }; }

  await notifyAprismOfInquiry(inquiry);

  return { status: "success", message: "Thank you. Your $295 Property Assessment request has been received. APRISM will respond within one business day to confirm the property, appointment, and payment.", analytics: { lead_type: "property_assessment", service_interest: "Property Assessment", source } };
}
