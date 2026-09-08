"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const actionMessage = (message: string) => encodeURIComponent(message);

export async function setInvitedUserPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");

  if (password.length < 12 || password.length > 128 || password !== confirmation) {
    redirect(`/portal/set-password?error=${actionMessage("Use a matching password of at least 12 characters.")}`);
  }

  const supabase = await createClient();
  if (!supabase) redirect(`/portal/set-password?error=${actionMessage("Secure portal access is not configured.")}`);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/portal/login?next=/portal/set-password");

  const { data: membership, error: membershipError } = await supabase
    .from("client_account_members")
    .select("id, active, client_accounts!inner(id, account_type, status)")
    .eq("user_id", userData.user.id)
    .eq("active", true)
    .eq("client_accounts.status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    await supabase.auth.signOut();
    redirect(`/auth/invite/error?message=${actionMessage("Your APRISM client access is not active.")}`);
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password });
  if (passwordError) {
    console.error("APRISM invited password setup failed", { code: passwordError.code });
    redirect(`/portal/set-password?error=${actionMessage("Your password could not be saved. Please choose a different password and try again.")}`);
  }

  revalidatePath("/portal", "layout");
  redirect("/portal/business");
}
