"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";
import { createClient } from "@/lib/supabase/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const inquiryStatuses = new Set(["new", "contacted", "qualified", "closed"]);
const requestStatuses = new Set(["submitted", "reviewing", "scheduled", "in_progress", "completed", "cancelled"]);

export async function updateInquiryStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!uuidPattern.test(id) || !inquiryStatuses.has(status)) return;

  const { supabase } = await requireStaff();
  await supabase.from("inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function updateServiceRequestStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!uuidPattern.test(id) || !requestStatuses.has(status)) return;

  const { supabase } = await requireStaff();
  await supabase.from("service_requests").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function adminSignOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/portal/login?next=/admin");
}
