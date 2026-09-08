"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";

const healthStates = new Set(["Healthy", "Monitor", "Action Recommended", "Critical"]);
const occupancyTypes = new Set(["primary", "second_home", "other"]);
const value = (formData: FormData, name: string, max = 500) => String(formData.get(name) ?? "").trim().slice(0, max);

export async function createProperty(formData: FormData) {
  const name = value(formData, "name", 160);
  const address = value(formData, "address_line_1", 240);
  const city = value(formData, "city", 120);
  const state = value(formData, "state", 2).toUpperCase();
  const propertyType = value(formData, "property_type", 120);
  const health = value(formData, "health_status", 40);
  const occupancy = value(formData, "occupancy_type", 40);
  if (!name || !address || !city || state.length !== 2 || !propertyType || !healthStates.has(health) || !occupancyTypes.has(occupancy)) return;

  const { supabase } = await requireStaff();
  const { data, error } = await supabase.from("properties").insert({
    name,
    address_line_1: address,
    address_line_2: value(formData, "address_line_2", 240) || null,
    city,
    state,
    postal_code: value(formData, "postal_code", 20) || null,
    property_type: propertyType,
    occupancy_type: occupancy,
    health_status: health,
    summary: value(formData, "summary", 4000) || null,
  }).select("id").single();
  if (error || !data?.id) {
    console.error("APRISM property create failed", { code: error?.code ?? "missing_property_id" });
    return;
  }
  revalidatePath("/admin/properties");
  redirect(`/admin/properties/${data.id}`);
}
