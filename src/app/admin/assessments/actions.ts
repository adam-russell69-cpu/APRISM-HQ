"use server";

import { revalidatePath } from "next/cache";
import { assessmentAreaKey, fieldAssessmentAreas, findingStatuses, reportFields } from "@/lib/assessment-config";
import { requireStaff } from "@/lib/admin-account";

export type AssessmentAdminState = {
  status: "idle" | "error" | "success";
  message: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedStatuses = new Set(findingStatuses);

function value(formData: FormData, name: string, maxLength = 8000) {
  return String(formData.get(name) ?? "").trim().slice(0, maxLength);
}

function nullableUuid(formData: FormData, name: string) {
  const id = value(formData, name, 50);
  return uuidPattern.test(id) ? id : null;
}

export async function saveFieldAssessment(_previousState: AssessmentAdminState, formData: FormData): Promise<AssessmentAdminState> {
  const propertyLabel = value(formData, "property_label", 240);
  const assessmentDate = value(formData, "assessment_date", 10);
  if (!propertyLabel || !/^\d{4}-\d{2}-\d{2}$/.test(assessmentDate)) {
    return { status: "error", message: "Add the property / client and assessment date before saving." };
  }

  const findings = fieldAssessmentAreas.map((area) => {
    const key = assessmentAreaKey(area);
    const status = value(formData, `${key}_status`, 40);
    return {
      area,
      status: allowedStatuses.has(status as (typeof findingStatuses)[number]) ? status : "Monitor",
      notes: value(formData, `${key}_notes`),
    };
  });

  const { supabase, account } = await requireStaff();
  const { error } = await supabase.from("property_assessments").insert({
    property_id: nullableUuid(formData, "property_id"),
    inquiry_id: nullableUuid(formData, "inquiry_id"),
    assessment_date: assessmentDate,
    status: "field_draft",
    intake_data: { property_label: propertyLabel, client_name: value(formData, "client_name", 240) },
    field_notes: { assessor: account.displayName, general_notes: value(formData, "general_notes") },
    findings,
    created_by: account.userId,
  });

  if (error) {
    console.error("APRISM field assessment save failed", { code: error.code });
    return { status: "error", message: "The field assessment could not be saved. Please try again." };
  }

  revalidatePath("/admin/assessments");
  return { status: "success", message: "Field assessment draft saved." };
}

export async function saveAssessmentReport(_previousState: AssessmentAdminState, formData: FormData): Promise<AssessmentAdminState> {
  const propertyLabel = value(formData, "property_label", 240);
  const clientName = value(formData, "client_name", 240);
  const assessmentDate = value(formData, "assessment_date", 10);
  if (!propertyLabel || !clientName || !/^\d{4}-\d{2}-\d{2}$/.test(assessmentDate)) {
    return { status: "error", message: "Add the client, property, and assessment date before saving." };
  }

  const reportData = Object.fromEntries(reportFields.map(([name]) => [name, value(formData, name)]));
  const { supabase, account } = await requireStaff();
  const { error } = await supabase.from("property_assessments").insert({
    property_id: nullableUuid(formData, "property_id"),
    inquiry_id: nullableUuid(formData, "inquiry_id"),
    assessment_date: assessmentDate,
    status: "report_draft",
    intake_data: { property_label: propertyLabel, client_name: clientName },
    report_data: { ...reportData, prepared_by: account.displayName },
    stewardship_recommendation: reportData.stewardship_recommendation || null,
    created_by: account.userId,
  });

  if (error) {
    console.error("APRISM assessment report save failed", { code: error.code });
    return { status: "error", message: "The assessment report could not be saved. Please try again." };
  }

  revalidatePath("/admin/assessments");
  return { status: "success", message: "Property assessment report draft saved." };
}
