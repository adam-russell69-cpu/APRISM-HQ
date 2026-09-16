"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin-account";

function workOrderPath(workOrderId: string) {
  return `/admin/work-orders/${workOrderId}`;
}

export async function startVisit(formData: FormData) {
  const workOrderId = String(formData.get("workOrderId") ?? "").trim();
  if (!workOrderId) return;

  const { supabase, account } = await requireStaff();

  const { data: workOrder } = await supabase
    .from("work_orders")
    .select("id, status")
    .eq("id", workOrderId)
    .maybeSingle();

  if (!workOrder || ["completed", "cancelled", "invoiced", "paid"].includes(workOrder.status)) return;

  const { data: activeVisit } = await supabase
    .from("service_visits")
    .select("id")
    .eq("work_order_id", workOrderId)
    .is("ended_at", null)
    .not("started_at", "is", null)
    .maybeSingle();

  if (activeVisit) {
    revalidatePath(workOrderPath(workOrderId));
    return;
  }

  const startedAt = new Date().toISOString();
  const { data: visit, error: visitError } = await supabase
    .from("service_visits")
    .insert({
      work_order_id: workOrderId,
      technician_id: account.userId,
      started_at: startedAt,
    })
    .select("id")
    .single();

  if (visitError || !visit) {
    console.error("[field-visit] Could not start visit", { code: visitError?.code, message: visitError?.message });
    return;
  }

  await Promise.all([
    supabase.from("work_orders").update({ status: "in_progress", assigned_to: account.userId }).eq("id", workOrderId),
    supabase.from("work_order_activity").insert({
      work_order_id: workOrderId,
      actor_user_id: account.userId,
      event_type: "visit_started",
      details: { visit_id: visit.id, started_at: startedAt },
      visibility: "customer",
    }),
  ]);

  revalidatePath("/admin/work-orders");
  revalidatePath(workOrderPath(workOrderId));
}

export async function endVisit(formData: FormData) {
  const workOrderId = String(formData.get("workOrderId") ?? "").trim();
  const diagnosis = String(formData.get("diagnosis") ?? "").trim();
  const workPerformed = String(formData.get("workPerformed") ?? "").trim();
  const recommendation = String(formData.get("recommendation") ?? "").trim();
  const clientNotes = String(formData.get("clientNotes") ?? "").trim();
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();
  const outcome = String(formData.get("outcome") ?? "return_required");
  const returnReason = String(formData.get("returnReason") ?? "").trim();

  if (!workOrderId) return;

  const { supabase, account } = await requireStaff();
  const { data: activeVisit } = await supabase
    .from("service_visits")
    .select("id, started_at")
    .eq("work_order_id", workOrderId)
    .is("ended_at", null)
    .not("started_at", "is", null)
    .maybeSingle();

  if (!activeVisit) return;

  const endedAt = new Date().toISOString();
  const complete = outcome === "complete";
  const normalizedReason = complete ? null : (returnReason || "scheduled_return");
  const nextStatus = complete
    ? "completed"
    : normalizedReason === "waiting_parts"
      ? "waiting_parts"
      : normalizedReason === "awaiting_approval"
        ? "awaiting_approval"
        : "scheduled";

  const { error: visitError } = await supabase
    .from("service_visits")
    .update({
      ended_at: endedAt,
      diagnosis: diagnosis || null,
      work_performed: workPerformed || null,
      recommendation: recommendation || null,
      client_notes: clientNotes || null,
      internal_notes: internalNotes || null,
      outcome: complete ? "complete" : "return_required",
      return_reason: normalizedReason,
    })
    .eq("id", activeVisit.id);

  if (visitError) {
    console.error("[field-visit] Could not end visit", { code: visitError.code, message: visitError.message });
    return;
  }

  await Promise.all([
    supabase
      .from("work_orders")
      .update({ status: nextStatus, completed_at: complete ? endedAt : null })
      .eq("id", workOrderId),
    supabase.from("work_order_activity").insert({
      work_order_id: workOrderId,
      actor_user_id: account.userId,
      event_type: complete ? "visit_completed" : "visit_ended_return_required",
      details: { visit_id: activeVisit.id, ended_at: endedAt, next_status: nextStatus, return_reason: normalizedReason },
      visibility: "customer",
    }),
  ]);

  revalidatePath("/admin/work-orders");
  revalidatePath(workOrderPath(workOrderId));
  revalidatePath("/portal/business/work-orders");
}
