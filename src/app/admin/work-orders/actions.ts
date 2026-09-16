"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const outcomes = new Set(["complete", "return_required"]);
const returnReasons = new Set(["waiting_parts", "awaiting_approval", "additional_diagnosis", "scheduled_return", "other"]);
const suppliedByValues = new Set(["aprism", "property_manager", "homeowner", "resident", "other"]);
const photoCategories = new Set(["before", "diagnostic", "during", "after"]);
const visibilityValues = new Set(["internal", "customer", "resident"]);

function text(formData: FormData, key: string, max = 5000) {
  return String(formData.get(key) ?? "").trim().slice(0, max) || null;
}

function decimal(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

async function activeVisitForWorkOrder(
  supabase: Awaited<ReturnType<typeof requireStaff>>["supabase"],
  workOrderId: string,
) {
  const { data } = await supabase
    .from("service_visits")
    .select("id, started_at")
    .eq("work_order_id", workOrderId)
    .is("ended_at", null)
    .not("started_at", "is", null)
    .maybeSingle();
  return data;
}

export async function createWorkOrderFromRequest(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  if (!uuidPattern.test(requestId)) return;

  const { supabase, account } = await requireStaff();
  const { data: existing } = await supabase.from("work_orders").select("id").eq("service_request_id", requestId).maybeSingle();
  if (existing?.id) redirect(`/admin/work-orders/${existing.id}`);

  const { data: request } = await supabase.from("service_requests").select("id, property_id, requested_by, title, description").eq("id", requestId).maybeSingle();
  if (!request) return;
  const { data: property } = await supabase.from("properties").select("id, client_account_id").eq("id", request.property_id).maybeSingle();
  if (!property?.client_account_id) return;
  const { data: clientAccount } = await supabase.from("client_accounts").select("account_type").eq("id", property.client_account_id).maybeSingle();

  const source = clientAccount?.account_type === "business" ? "property_manager" : "homeowner";
  const visibility = source === "property_manager" ? "customer" : "resident";
  const { data: workOrder, error } = await supabase.from("work_orders").insert({
    client_account_id: property.client_account_id,
    property_id: request.property_id,
    service_request_id: request.id,
    title: request.title,
    description: request.description,
    status: "requested",
    priority: "routine",
    requested_by: request.requested_by,
    assigned_to: account.userId,
    source,
    visibility,
  }).select("id").single();

  if (error || !workOrder) {
    console.error("APRISM V1-A work order creation failed", { code: error?.code });
    return;
  }
  await supabase.from("work_order_activity").insert({ work_order_id: workOrder.id, actor_user_id: account.userId, event_type: "work_order_created", visibility, details: { service_request_id: request.id, source } });
  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/admin/work-orders");
  redirect(`/admin/work-orders/${workOrder.id}`);
}

export async function startVisit(formData: FormData) {
  const workOrderId = String(formData.get("workOrderId") ?? "");
  if (!uuidPattern.test(workOrderId)) return;
  const { supabase, account } = await requireStaff();
  const { data: workOrder } = await supabase.from("work_orders").select("id, status").eq("id", workOrderId).maybeSingle();
  if (!workOrder || ["completed", "cancelled", "invoiced", "paid"].includes(workOrder.status)) return;
  if (await activeVisitForWorkOrder(supabase, workOrderId)) return;

  const now = new Date().toISOString();
  const { data: visit, error } = await supabase.from("service_visits").insert({ work_order_id: workOrderId, technician_id: account.userId, started_at: now }).select("id").single();
  if (error || !visit) {
    console.error("APRISM V1-A visit start failed", { code: error?.code });
    return;
  }
  await Promise.all([
    supabase.from("work_orders").update({ status: "in_progress", assigned_to: account.userId }).eq("id", workOrderId),
    supabase.from("work_order_activity").insert({ work_order_id: workOrderId, actor_user_id: account.userId, event_type: "visit_started", visibility: "customer", details: { visit_id: visit.id, started_at: now } }),
  ]);
  revalidatePath(`/admin/work-orders/${workOrderId}`);
  revalidatePath("/admin/work-orders");
}

export async function addVisitMaterial(formData: FormData) {
  const workOrderId = String(formData.get("workOrderId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim().slice(0, 500);
  const quantity = decimal(formData.get("quantity")) ?? 1;
  const unitCost = decimal(formData.get("unitCost"));
  const clientCharge = decimal(formData.get("clientCharge"));
  const suppliedByRaw = String(formData.get("suppliedBy") ?? "aprism").trim();
  if (!uuidPattern.test(workOrderId) || !description) return;

  const { supabase, account } = await requireStaff();
  const activeVisit = await activeVisitForWorkOrder(supabase, workOrderId);
  if (!activeVisit) return;
  const suppliedBy = suppliedByValues.has(suppliedByRaw) ? suppliedByRaw : "other";
  const { data: material, error } = await supabase.from("visit_materials").insert({
    service_visit_id: activeVisit.id,
    description,
    quantity,
    unit_cost: unitCost,
    client_charge: clientCharge,
    supplied_by: suppliedBy,
    visibility: "customer",
  }).select("id").single();
  if (error || !material) {
    console.error("APRISM V1-A material insert failed", { code: error?.code });
    return;
  }
  await supabase.from("work_order_activity").insert({ work_order_id: workOrderId, actor_user_id: account.userId, event_type: "material_added", visibility: "internal", details: { material_id: material.id, description, quantity, supplied_by: suppliedBy } });
  revalidatePath(`/admin/work-orders/${workOrderId}`);
}

export async function uploadVisitPhoto(formData: FormData) {
  const workOrderId = String(formData.get("workOrderId") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "diagnostic").trim();
  const visibilityRaw = String(formData.get("visibility") ?? "customer").trim();
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 500);
  const file = formData.get("photo");
  if (!uuidPattern.test(workOrderId) || !(file instanceof File) || file.size === 0 || file.size > 12 * 1024 * 1024) return;

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
  if (!allowedTypes.has(file.type)) return;
  const { supabase, account } = await requireStaff();
  const activeVisit = await activeVisitForWorkOrder(supabase, workOrderId);
  if (!activeVisit) return;

  const category = photoCategories.has(categoryRaw) ? categoryRaw : "diagnostic";
  const visibility = visibilityValues.has(visibilityRaw) ? visibilityRaw : "customer";
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const storagePath = `${workOrderId}/${activeVisit.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("field-photos").upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error("APRISM V1-A field photo upload failed", { message: uploadError.message });
    return;
  }
  const { data: photo, error: recordError } = await supabase.from("service_visit_photos").insert({ service_visit_id: activeVisit.id, storage_path: storagePath, category, visibility, caption: caption || null, created_by: account.userId }).select("id").single();
  if (recordError || !photo) {
    await supabase.storage.from("field-photos").remove([storagePath]);
    console.error("APRISM V1-A field photo record failed", { code: recordError?.code });
    return;
  }
  await supabase.from("work_order_activity").insert({ work_order_id: workOrderId, actor_user_id: account.userId, event_type: "photo_added", visibility: visibility === "internal" ? "internal" : visibility, details: { photo_id: photo.id, category } });
  revalidatePath(`/admin/work-orders/${workOrderId}`);
}

export async function endVisit(formData: FormData) {
  const workOrderId = String(formData.get("workOrderId") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  const returnReasonRaw = String(formData.get("returnReason") ?? "");
  if (!uuidPattern.test(workOrderId) || !outcomes.has(outcome)) return;
  const returnReason = outcome === "return_required" && returnReasons.has(returnReasonRaw) ? returnReasonRaw : null;
  if (outcome === "return_required" && !returnReason) return;

  const { supabase, account } = await requireStaff();
  const visit = await activeVisitForWorkOrder(supabase, workOrderId);
  if (!visit?.started_at) return;
  const endedAt = new Date();
  const durationMinutes = Math.max(0, Math.round((endedAt.getTime() - new Date(visit.started_at).getTime()) / 60000));
  const { error } = await supabase.from("service_visits").update({
    ended_at: endedAt.toISOString(), duration_minutes: durationMinutes,
    diagnosis: text(formData, "diagnosis"), work_performed: text(formData, "workPerformed"), recommendation: text(formData, "recommendation"),
    internal_notes: text(formData, "internalNotes"), client_notes: text(formData, "clientNotes"), outcome, return_reason: returnReason,
  }).eq("id", visit.id);
  if (error) {
    console.error("APRISM V1-A visit completion failed", { code: error.code });
    return;
  }

  const nextStatus = outcome === "complete" ? "completed" : returnReason === "waiting_parts" ? "waiting_parts" : returnReason === "awaiting_approval" ? "awaiting_approval" : "scheduled";
  await Promise.all([
    supabase.from("work_orders").update({ status: nextStatus, completed_at: outcome === "complete" ? endedAt.toISOString() : null }).eq("id", workOrderId),
    supabase.from("work_order_activity").insert({ work_order_id: workOrderId, actor_user_id: account.userId, event_type: outcome === "complete" ? "visit_completed" : "return_required", visibility: "customer", details: { visit_id: visit.id, ended_at: endedAt.toISOString(), duration_minutes: durationMinutes, return_reason: returnReason } }),
  ]);
  revalidatePath(`/admin/work-orders/${workOrderId}`);
  revalidatePath("/admin/work-orders");
  revalidatePath("/admin/requests");
}
