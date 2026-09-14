"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";
import { createClient } from "@/lib/supabase/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const inquiryStatuses = new Set(["new", "contacted", "qualified", "closed"]);
const requestStatuses = new Set(["submitted", "reviewing", "scheduled", "in_progress", "completed", "cancelled"]);
const issueStatuses = new Set(["open", "monitoring", "in_progress", "resolved", "closed"]);

function parseMoney(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "0").replace(/[$,]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
}

export async function updateWorkingCapital(formData: FormData) {
  const operatingCash = parseMoney(formData.get("operating_cash"));
  const ownerPaidUnreimbursed = parseMoney(formData.get("owner_paid_unreimbursed"));
  const clientAdvances = parseMoney(formData.get("client_advances"));
  const upcomingCommitments = parseMoney(formData.get("upcoming_commitments"));
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 2000) || null;

  const { supabase, account } = await requireStaff();
  const { error } = await supabase.from("working_capital").upsert({
    singleton_id: 1,
    operating_cash: operatingCash,
    owner_paid_unreimbursed: ownerPaidUnreimbursed,
    client_advances: clientAdvances,
    upcoming_commitments: upcomingCommitments,
    minimum_reserve_target: 2500,
    stability_reserve_target: 5000,
    notes,
    updated_by: account.userId,
  }, { onConflict: "singleton_id" });

  if (error) console.error("APRISM working capital update failed", { code: error.code });
  revalidatePath("/admin");
}

export async function updateInquiryStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!uuidPattern.test(id) || !inquiryStatuses.has(status)) return;

  const { supabase } = await requireStaff();
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) console.error("APRISM inquiry status update failed", { code: error.code });
  revalidatePath("/admin");
  revalidatePath("/admin/clients");
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
