"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";
import { createClient } from "@/lib/supabase/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const inquiryStatuses = new Set(["new", "assessment_requested", "scheduled", "completed", "stewardship_offered", "converted", "lost", "contacted", "qualified", "closed"]);
const requestStatuses = new Set(["submitted", "reviewing", "scheduled", "in_progress", "completed", "cancelled"]);
const issueStatuses = new Set(["open", "monitoring", "in_progress", "resolved", "closed"]);

export async function updateInquiryStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!uuidPattern.test(id) || !inquiryStatuses.has(status)) return;

  const { supabase, account } = await requireStaff();
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) {
    console.error("APRISM inquiry status update failed", { code: error.code });
    return;
  }

  if (status === "scheduled") {
    const { data: inquiry } = await supabase
      .from("inquiries")
      .select("id, name, email, phone, property_location, property_type, residency, home_size, preferred_contact_method, preferred_time, message")
      .eq("id", id)
      .maybeSingle();

    if (inquiry) {
      const { data: existing } = await supabase.from("property_assessments").select("id").eq("inquiry_id", id).maybeSingle();
      if (!existing) {
        const intakeData = {
          owner_name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          property_address: inquiry.property_location,
          property_type: inquiry.property_type,
          property_use: inquiry.residency,
          square_feet: inquiry.home_size,
          preferred_contact: [inquiry.preferred_contact_method, inquiry.preferred_time].filter(Boolean).join(" · "),
          current_concerns: inquiry.message,
          owner_priorities: inquiry.message,
        };
        const { error: assessmentError } = await supabase.from("property_assessments").insert({
          inquiry_id: id,
          status: "scheduled",
          intake_data: intakeData,
          created_by: account.userId,
        });
        if (assessmentError) console.error("APRISM scheduled assessment creation failed", { code: assessmentError.code });
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/assessments");
  revalidatePath(`/admin/clients/leads/${id}`);
}

export async function updateServiceRequestStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!uuidPattern.test(id) || !requestStatuses.has(status)) return;

  const { supabase } = await requireStaff();
  const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
  if (error) console.error("APRISM service request status update failed", { code: error.code });
  revalidatePath("/admin");
  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${id}`);
}

export async function updateIssueStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!uuidPattern.test(id) || !issueStatuses.has(status)) return;

  const { supabase } = await requireStaff();
  const { error } = await supabase.from("issues").update({ status, resolved_at: ["resolved", "closed"].includes(status) ? new Date().toISOString() : null }).eq("id", id);
  if (error) console.error("APRISM issue status update failed", { code: error.code });
  revalidatePath("/admin");
  revalidatePath("/admin/issues");
  revalidatePath(`/admin/issues/${id}`);
}

export async function adminSignOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/portal/login?next=/admin");
}
