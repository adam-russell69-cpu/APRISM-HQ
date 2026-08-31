"use server";

import { intakeFieldNames, requiredIntakeFields } from "@/lib/assessment-config";
import { createClient } from "@/lib/supabase/server";

export type IntakeState = {
  status: "idle" | "error" | "success";
  message: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitAssessmentIntake(_previousState: IntakeState, formData: FormData): Promise<IntakeState> {
  if (String(formData.get("companyWebsite") ?? "")) {
    return { status: "success", message: "Thank you. Your intake has been received." };
  }

  const intakeData = Object.fromEntries(intakeFieldNames.map((field) => {
    const rawValue = formData.get(field);
    return [field, rawValue === "on" ? true : String(rawValue ?? "").trim()];
  }));

  const missingRequired = requiredIntakeFields.some((field) => !intakeData[field]);
  const hasOversizedValue = Object.values(intakeData).some((fieldValue) => typeof fieldValue === "string" && fieldValue.length > 5000);

  if (missingRequired) {
    return { status: "error", message: "Please complete each required field and acknowledgment." };
  }
  if (!emailPattern.test(String(intakeData.email)) || hasOversizedValue) {
    return { status: "error", message: "Please review the form details and try again." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "error", message: "We could not securely receive the intake right now. Please try again shortly." };
  }

  const { error } = await supabase.from("property_assessments").insert({
    status: "intake_received",
    intake_data: intakeData,
  });

  if (error) {
    console.error("APRISM assessment intake submission failed", { code: error.code });
    return { status: "error", message: "We could not securely receive the intake right now. Please try again shortly." };
  }

  return {
    status: "success",
    message: "Your property assessment intake has been received. APRISM will review it before the scheduled visit.",
  };
}
