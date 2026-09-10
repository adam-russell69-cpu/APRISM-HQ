"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function field(formData: FormData, name: string, max = 120) {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

function message(value: string) {
  return encodeURIComponent(value);
}

export async function updateRecurringRelationship(formData: FormData) {
  const { supabase } = await requireStaff();
  const accountId = field(formData, "account_id", 36);
  const recurringActive = field(formData, "recurring_active", 10) === "true";
  const rawMonthlyValue = field(formData, "expected_monthly_value", 20);
  const parsedMonthlyValue = rawMonthlyValue === "" ? 0 : Number(rawMonthlyValue);

  if (!uuidPattern.test(accountId) || !Number.isFinite(parsedMonthlyValue) || parsedMonthlyValue < 0 || parsedMonthlyValue > 1000000) {
    if (uuidPattern.test(accountId)) {
      redirect(`/admin/clients/${accountId}?error=${message("Enter a valid recurring relationship and monthly value.")}`);
    }
    redirect("/admin/clients?view=clients");
  }

  const expectedMonthlyValue = recurringActive ? Math.round(parsedMonthlyValue * 100) / 100 : 0;

  const { data, error } = await supabase
    .from("client_accounts")
    .update({
      recurring_active: recurringActive,
      expected_monthly_value: expectedMonthlyValue,
    })
    .eq("id", accountId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("APRISM recurring relationship update failed", { code: error?.code ?? "client_account_not_found" });
    redirect(`/admin/clients/${accountId}?error=${message("The recurring relationship could not be updated.")}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${accountId}`);
  redirect(`/admin/clients/${accountId}?notice=${message("Recurring relationship updated. Proof Mode refreshed.")}`);
}
