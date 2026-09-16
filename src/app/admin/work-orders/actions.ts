"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const outcomes = new Set(["complete", "return_required"]);
const returnReasons = new Set(["waiting_parts", "awaiting_approval", "additional_diagnosis", "scheduled_return", "other"]);

function text(formData: FormData, key: string, max = 5000) {
  return String(formData.get(key) ?? "").trim().slice(0, max) || null;
}

export async function createWorkOrderFromRequest(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  if (!uuidPattern.test(requestId)) return;

  const { supabase, account } = await requireStaff();
  const { data: existing } = await supabase
    .from("work_orders")
    .select("id")
    .eq("service_request_id", requestId)
    .maybeSingle();
  if (existing?.id) redirect(`/admin/work-orders/${existing.id}`);

  const { data: request } = await supabase
    .from("service_requests")
    .select("id, property_id, requested_by, title, description")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) return;

  const { data: property } = await supabase
    .from("properties")
    .select("id, client_account_id")
    .eq("id", request.property_id)
    .maybeSingle();
  if (!property?.client_account_id) return;

  const { data: clientAccount } = await supabase
    .from("client_accounts")
    .select("account_type")
    .eq("id", property.client_account_id)
    .maybeSingle();

  const source = clientAccount?.account_type === "business" ? "property_manager" : "homeowner";
  const visibility = source === "property_manager" ? "customer" : "resident";
  const { data: workOrder, error } = await supabase
    .from("work_orders")
    .insert({
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
    })
    .select("id")
    .single();

  if (error || !workOrder) {
    console.error("APRISM V1-A work order creation failed", { code: error?.code });
    return;
  }

  await supabase.from("work_order_activity").insert({
    work_order_id: workOrder.id,
    actor_user_id: account.userId,
    event_type: "work_order_created",
    visibility,
    details: { service_request_id: request.id, source },
  });

  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/admin/work-orders");
  redirect(`/admin/work-orders/${workOrder.id}`);
}

export async function startVisit(formData: FormData) {
  const workOrderId = String(formData.get("workOrderId") ?? "");
  if (!uuidPattern.test(workOrderId)) return;

  const { supabase, account } = await requireStaff();
  const { data: active } = await supabase
    .from("service_visits")
    .select("id")
    .eq("work_order_id", workOrderId)
    .is("ended_at", null)
    .maybeSingle();
  if (active) return;

  const now = new Date().toISOString();
  const { error } = await supabase.from("service_visits").insert({
    work_order_id: workOrderId,
    technician_id: account.userId,
    started_at: now,
  });
  if (error) {
    console.error("APRISM V1-A visit start failed", { code: error.code });
    return;
  }

  await Promise.all([
    supabase.from("work_orders").update({ status: "in_progress" }).eq("id", workOrderId),
    supabase.from("work_order_activity").insert({
      work_order_id: workOrderId,
      actor_user_id: account.userId,
      event_type: "visit_started",
      visibility: "internal",
      details: { started_at: now },
    }),
  ]);

  revalidatePath(`/admin/work-orders/${workOrderId}`);
  revalidatePath("/admin/work-orders");
}

export async function endVisit(formData: FormData) {
  const workOrderId = String(formData.get("workOrderId") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  const returnReasonRaw = String(formData.get("returnReason") ?? "");
  if (!uuidPattern.test(workOrderId) || !outcomes.has(outcome)) return;
  const returnReason = outcome === "return_required" && returnReasons.has(returnReasonRaw) ? returnReasonRaw : null;
  if (outcome === "return_required" && !returnReason) return;

  const { supabase, account } = await requireStaff();
  const { data: visit } = await supabase
    .from("service_visits")
    .select("id, started_at")
    .eq("work_order_id", workOrderId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!visit?.started_at) return;

  const endedAt = new Date();
  const durationMinutes = Math.max(0, Math.round((endedAt.getTime() - new Date(visit.started_at).getTime()) / 60000));
  const { error } = await supabase
    .from("service_visits")
    .update({
      ended_at: endedAt.toISOString(),
      duration_minutes: durationMinutes,
      diagnosis: text(formData, "diagnosis"),
      work_performed: text(formData, "workPerformed"),
      recommendation: text(formData, "recommendation"),
      internal_notes: text(formData, "internalNotes"),
      client_notes: text(formData, "clientNotes"),
      outcome,
      return_reason: returnReason,
    })
    .eq("id", visit.id);
  if (error) {
    console.error("APRISM V1-A visit completion failed", { code: error.code });
    return;
  }

  const nextStatus = outcome === "complete"
    ? "completed"
    : returnReason === "waiting_parts"
      ? "waiting_parts"
      : returnReason === "awaiting_approval"
        ? "awaiting_approval"
        : "scheduled";

  await Promise.all([
    supabase.from("work_orders").update({
      status: nextStatus,
      completed_at: outcome === "complete" ? endedAt.toISOString() : null,
    }).eq("id", workOrderId),
    supabase.from("work_order_activity").insert({
      work_order_id: workOrderId,
      actor_user_id: account.userId,
      event_type: outcome === "complete" ? "visit_completed" : "return_required",
      visibility: "customer",
      details: { ended_at: endedAt.toISOString(), duration_minutes: durationMinutes, return_reason: returnReason },
    }),
  ]);

  revalidatePath(`/admin/work-orders/${workOrderId}`);
  revalidatePath("/admin/work-orders");
  revalidatePath("/admin/requests");
}
