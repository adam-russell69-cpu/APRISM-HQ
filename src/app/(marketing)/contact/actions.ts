"use server";

export type InquiryState = {
  status: "idle" | "error" | "success";
  message: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitInquiry(
  _previousState: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const requiredFields = ["name", "email", "phone", "propertyLocation", "propertyType", "residency", "homeSize", "preferredContact", "message"];
  const missing = requiredFields.some((field) => !String(formData.get(field) ?? "").trim());
  const email = String(formData.get("email") ?? "").trim();
  const services = formData.getAll("services").map(String);

  if (missing || services.length === 0) {
    return { status: "error", message: "Please complete each required field and select at least one service." };
  }

  if (!emailPattern.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  // Placeholder boundary: validated data will be written to the new APRISM
  // Supabase project once its credentials and inquiry destination are connected.
  return {
    status: "success",
    message: "Thank you. Your request is ready for APRISM review. Submission delivery will activate when the new APRISM Supabase project is connected.",
  };
}
