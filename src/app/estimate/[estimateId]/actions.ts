"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function respond(formData: FormData, decision: "approved" | "declined") {
  const estimateId = String(formData.get("estimateId") ?? "").trim();
  if (!uuidPattern.test(estimateId)) redirect("/");
  const admin = createAdminClient();
  if (!admin) redirect(`/estimate/${estimateId}?response=unavailable`);

  const { data: estimate } = await admin.from("estimates").select("id,status,valid_until").eq("id", estimateId).maybeSingle();
  if (!estimate) redirect("/");
  if (!["sent", "draft"].includes(estimate.status)) redirect(`/estimate/${estimateId}?response=${estimate.status}`);
  if (estimate.valid_until < new Date().toISOString().slice(0, 10)) {
    await admin.from("estimates").update({ status: "expired" }).eq("id", estimateId);
    redirect(`/estimate/${estimateId}?response=expired`);
  }

  const timestamp = new Date().toISOString();
  await admin.from("estimates").update(decision === "approved"
    ? { status: "approved", approved_at: timestamp, declined_at: null }
    : { status: "declined", declined_at: timestamp, approved_at: null }
  ).eq("id", estimateId);
  revalidatePath(`/estimate/${estimateId}`);
  redirect(`/estimate/${estimateId}?response=${decision}`);
}

export async function approveEstimate(formData: FormData) { return respond(formData, "approved"); }
export async function declineEstimate(formData: FormData) { return respond(formData, "declined"); }
