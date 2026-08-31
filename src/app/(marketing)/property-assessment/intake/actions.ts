"use server";

import { randomUUID } from "node:crypto";
import { intakeFieldNames, requiredIntakeFields } from "@/lib/assessment-config";
import { createAssessmentIntakeClient } from "@/lib/supabase/assessment-intake";

export type IntakeState = {
  status: "idle" | "error" | "success";
  message: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitAssessmentIntake(_previousState: IntakeState, formData: FormData): Promise<IntakeState> {
  if (String(formData.get("aprism_check_47") ?? "")) {
    console.info("[assessment-intake] honeypot triggered");
    return { status: "idle", message: "" };
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

  const receiptToken = randomUUID();
  const supabase = createAssessmentIntakeClient(receiptToken);
  if (!supabase) {
    return { status: "error", message: "We could not securely receive the intake right now. Please try again shortly." };
  }

  const { data, error } = await supabase
    .from("property_assessments")
    .insert({
      status: "intake_received",
      intake_data: intakeData,
      receipt_token: receiptToken,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    console.error("APRISM assessment intake submission failed", { code: error?.code ?? "missing_insert_id" });
    return { status: "error", message: "We could not securely receive the intake right now. Please try again shortly." };
  }

  const reference = data.id.replaceAll("-", "").slice(0, 6).toUpperCase();

  return {
    status: "success",
    message: `Your property assessment intake has been received. Reference: APR-${reference}`,
  };
}
