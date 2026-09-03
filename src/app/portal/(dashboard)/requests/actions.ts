"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type RequestState = { status: "idle" | "error" | "success"; message: string };

export async function submitServiceRequest(_previousState: RequestState, formData: FormData): Promise<RequestState> {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const preferredTiming = String(formData.get("preferredTiming") ?? "").trim();
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  if (!propertyId || !title || !category || !description) return { status: "error", message: "Choose a property and complete the request title, category, and details." };
  if (title.length > 120 || category.length > 80 || description.length > 5000 || preferredTiming.length > 250) return { status: "error", message: "One or more request fields are longer than the portal accepts." };

  const supabase = await createClient();
  if (!supabase) return { status: "success", message: "Request validated in MVP preview. It will be stored when the APRISM Supabase project is connected." };

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { status: "error", message: "Your session has expired. Please sign in again." };

  const { data: membership, error: membershipError } = await supabase.from("property_members").select("property_id").eq("user_id", userId).eq("property_id", propertyId).maybeSingle();
  if (membershipError || !membership) return { status: "error", message: "No authorized property membership was found for this account." };

  const { error } = await supabase.from("service_requests").insert({ property_id: membership.property_id, requested_by: userId, title, category, description, preferred_timing: preferredTiming || null });
  if (error) return { status: "error", message: "APRISM could not save this request. Please contact your steward directly." };
  revalidatePath("/portal");
  revalidatePath("/portal/requests");
  return { status: "success", message: "Your service request has been recorded for APRISM review." };
}
