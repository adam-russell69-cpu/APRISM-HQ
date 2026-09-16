"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin-account";

function workOrderPath(workOrderId: string) {
  return `/admin/work-orders/${workOrderId}`;
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

  const activeVisit = await activeVisitForWorkOrder(supabase, workOrderId);
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

export async function addVisitMaterial(formData: FormData) {
  const workOrderId = String(formData.get("workOrderId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim().slice(0, 500);
  const quantity = decimal(formData.get("quantity")) ?? 1;
  const unitCost = decimal(formData.get("unitCost"));
  const clientCharge = decimal(formData.get("clientCharge"));
  const suppliedBy = String(formData.get("suppliedBy") ?? "aprism").trim();
  if (!workOrderId || !description) return;

  const { supabase, account } = await requireStaff();
  const activeVisit = await activeVisitForWorkOrder(supabase, workOrderId);
  if (!activeVisit) return;

  const { data: material, error } = await supabase.from("visit_materials").insert({
    service_visit_id: activeVisit.id,
    description,
    quantity,
    unit_cost: unitCost,
    client_charge: clientCharge,
    supplied_by: ["aprism", "client", "property_manager", "homeowner", "other"].includes(suppliedBy) ? suppliedBy : "other",
    visibility: "customer",
  }).select("id").single();

  if (error || !material) {
    console.error("[field-visit] Material insert failed", { code: error?.code, message: error?.message });
    return;
  }

  await supabase.from("work_order_activity").insert({
    work_order_id: workOrderId,
    actor_user_id: account.userId,
    event_type: "material_added",
    details: { material_id: material.id, description, quantity, supplied_by: suppliedBy },
    visibility: "internal",
  });
  revalidatePath(workOrderPath(workOrderId));
}

export async function uploadVisitPhoto(formData: FormData) {
  const workOrderId = String(formData.get("workOrderId") ?? "").trim();
  const category = String(formData.get("category") ?? "diagnostic").trim();
  const visibility = String(formData.get("visibility") ?? "customer").trim();
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 500);
  const file = formData.get("photo");
  if (!workOrderId || !(file instanceof File) || file.size === 0 || file.size > 12 * 1024 * 1024) return;

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
  if (!allowedTypes.has(file.type)) return;

  const { supabase, account } = await requireStaff();
  const activeVisit = await activeVisitForWorkOrder(supabase, workOrderId);
  if (!activeVisit) return;

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const storagePath = `${workOrderId}/${activeVisit.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("field-photos").upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    console.error("[field-visit] Photo upload failed", { message: uploadError.message });
    return;
  }

  const { data: photo, error: recordError } = await supabase.from("service_visit_photos").insert({
    service_visit_id: activeVisit.id,
    storage_path: storagePath,
    category: ["before", "diagnostic", "during", "after"].includes(category) ? category : "diagnostic",
    visibility: ["internal", "customer", "resident"].includes(visibility) ? visibility : "customer",
    caption: caption || null,
    created_by: account.userId,
  }).select("id").single();

  if (recordError || !photo) {
    await supabase.storage.from("field-photos").remove([storagePath]);
    console.error("[field-visit] Photo record insert failed", { code: recordError?.code, message: recordError?.message });
    return;
  }

  await supabase.from("work_order_activity").insert({
    work_order_id: workOrderId,
    actor_user_id: account.userId,
    event_type: "photo_added",
    details: { photo_id: photo.id, category },
    visibility: visibility === "internal" ? "internal" : "customer",
  });
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
  const activeVisit = await activeVisitForWorkOrder(supabase, workOrderId);
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
