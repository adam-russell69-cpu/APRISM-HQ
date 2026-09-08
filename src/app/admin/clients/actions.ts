"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";
import { createAdminClient } from "@/lib/supabase/admin";

const accountTypes = new Set(["private", "business"]);
const accountStatuses = new Set(["prospect", "active", "inactive"]);
const memberRoles = new Set(["owner", "manager", "billing", "member"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const field = (formData: FormData, name: string, max = 500) => String(formData.get(name) ?? "").trim().slice(0, max);
const optional = (formData: FormData, name: string, max = 500) => field(formData, name, max) || null;
const actionMessage = (message: string) => encodeURIComponent(message);

function parseTerms(formData: FormData) {
  const raw = field(formData, "payment_terms_days", 3);
  const terms = Number(raw);
  return Number.isInteger(terms) && terms >= 0 && terms <= 365 ? terms : null;
}

function validOptionalEmail(email: string | null) {
  return !email || (email.length <= 254 && emailPattern.test(email));
}

function accountInput(formData: FormData) {
  const displayName = field(formData, "display_name", 160);
  const legalName = optional(formData, "legal_name", 200);
  const email = optional(formData, "email", 254)?.toLowerCase() ?? null;
  const phone = optional(formData, "phone", 40);
  const billingEmail = optional(formData, "billing_email", 254)?.toLowerCase() ?? null;
  const paymentTermsDays = parseTerms(formData);
  const status = field(formData, "status", 20);
  const valid = Boolean(displayName)
    && validOptionalEmail(email)
    && validOptionalEmail(billingEmail)
    && (!phone || phone.length >= 7)
    && paymentTermsDays !== null
    && accountStatuses.has(status);

  return { valid, displayName, legalName, email, phone, billingEmail, paymentTermsDays, status };
}

function clientErrorPath(id: string, message: string) {
  return `/admin/clients/${id}?error=${actionMessage(message)}`;
}

function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return null;
  try {
    const url = new URL(configured);
    return url.origin;
  } catch {
    return null;
  }
}

export async function createClientAccount(formData: FormData) {
  const { supabase } = await requireStaff();
  const accountType = field(formData, "account_type", 20);
  const input = accountInput(formData);
  if (!input.valid || !accountTypes.has(accountType)) {
    redirect(`/admin/clients/new?error=${actionMessage("Review the client details and submit again.")}`);
  }

  const { data, error } = await supabase.from("client_accounts").insert({
    account_type: accountType,
    display_name: input.displayName,
    legal_name: input.legalName,
    email: input.email,
    phone: input.phone,
    billing_email: input.billingEmail,
    payment_terms_days: input.paymentTermsDays,
    status: input.status,
  }).select("id").single();

  if (error || !data?.id) {
    console.error("APRISM client account create failed", { code: error?.code ?? "missing_client_account_id" });
    redirect(`/admin/clients/new?error=${actionMessage("The client account could not be created. No record was added.")}`);
  }

  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${data.id}?notice=${actionMessage("Client account created.")}`);
}

export async function updateClientAccount(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = field(formData, "account_id", 36);
  const input = accountInput(formData);
  if (!uuidPattern.test(id) || !input.valid) {
    if (uuidPattern.test(id)) redirect(clientErrorPath(id, "Review the account details and submit again."));
    redirect("/admin/clients?view=clients");
  }

  const { data, error } = await supabase.from("client_accounts").update({
    display_name: input.displayName,
    legal_name: input.legalName,
    email: input.email,
    phone: input.phone,
    billing_email: input.billingEmail,
    payment_terms_days: input.paymentTermsDays,
    status: input.status,
  }).eq("id", id).select("id").maybeSingle();

  if (error || !data) {
    console.error("APRISM client account update failed", { code: error?.code ?? "client_account_not_found" });
    redirect(clientErrorPath(id, "The client account could not be updated."));
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  redirect(`/admin/clients/${id}?notice=${actionMessage("Account details updated.")}`);
}

export async function inviteClientAccountMember(formData: FormData) {
  const { supabase } = await requireStaff();
  const accountId = field(formData, "account_id", 36);
  const email = field(formData, "email", 254).toLowerCase();
  const fullName = optional(formData, "full_name", 160);
  const role = field(formData, "role", 20);

  if (!uuidPattern.test(accountId) || !emailPattern.test(email) || !memberRoles.has(role)) {
    if (uuidPattern.test(accountId)) redirect(clientErrorPath(accountId, "Enter a valid email address and member role."));
    redirect("/admin/clients?view=clients");
  }

  const { data: account, error: accountError } = await supabase.from("client_accounts")
    .select("id, display_name, status")
    .eq("id", accountId)
    .maybeSingle();
  if (accountError || !account) redirect(clientErrorPath(accountId, "The client account could not be verified."));
  if (account.status === "inactive") redirect(clientErrorPath(accountId, "Reactivate this client account before inviting a portal member."));

  const admin = createAdminClient();
  const origin = siteOrigin();
  if (!admin || !origin) {
    console.error("APRISM client invitation is not configured", { adminConfigured: Boolean(admin), siteOriginConfigured: Boolean(origin) });
    redirect(clientErrorPath(accountId, "Client invitations are not configured on the server."));
  }

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/invite`,
    data: fullName ? { full_name: fullName } : undefined,
  });
  const userId = invited.user?.id;
  if (inviteError || !userId) {
    console.error("APRISM client invitation failed", { code: inviteError?.code ?? "missing_invited_user_id" });
    redirect(clientErrorPath(accountId, inviteError?.status === 422
      ? "That email already has an Auth account. Add the existing Auth user instead."
      : "The invitation could not be sent. No portal membership was added."));
  }

  const { error: membershipError } = await admin.from("client_account_members").insert({
    client_account_id: accountId,
    user_id: userId,
    role,
    active: true,
  });

  if (membershipError) {
    console.error("APRISM invited membership create failed", { code: membershipError.code });
    const { error: rollbackError } = await admin.auth.admin.deleteUser(userId);
    if (rollbackError) console.error("APRISM invited Auth user rollback failed", { code: rollbackError.code });
    redirect(clientErrorPath(accountId, "The invitation was cancelled because account access could not be provisioned."));
  }

  revalidatePath(`/admin/clients/${accountId}`);
  revalidatePath("/portal/business");
  redirect(`/admin/clients/${accountId}?notice=${actionMessage(`Invitation sent to ${email}. Membership is ${role} — active.`)}`);
}

export async function addClientAccountMember(formData: FormData) {
  const { supabase } = await requireStaff();
  const accountId = field(formData, "account_id", 36);
  const userId = field(formData, "user_id", 36);
  const role = field(formData, "role", 20);
  if (!uuidPattern.test(accountId) || !uuidPattern.test(userId) || !memberRoles.has(role)) {
    if (uuidPattern.test(accountId)) redirect(clientErrorPath(accountId, "Enter a valid existing Auth user ID and role."));
    redirect("/admin/clients?view=clients");
  }

  const { data: existing } = await supabase.from("client_account_members")
    .select("id")
    .eq("client_account_id", accountId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) redirect(clientErrorPath(accountId, "That Auth user is already a member of this account."));

  const { error } = await supabase.from("client_account_members").insert({
    client_account_id: accountId,
    user_id: userId,
    role,
    active: true,
  });

  if (error) {
    console.error("APRISM client account member create failed", { code: error.code });
    const message = error.code === "23503"
      ? "No existing Supabase Auth user matches that ID. Create the user before adding membership."
      : error.code === "23505"
        ? "That Auth user is already a member of this account."
        : "The member could not be added. Owner or admin access is required.";
    redirect(clientErrorPath(accountId, message));
  }

  revalidatePath(`/admin/clients/${accountId}`);
  revalidatePath("/portal/business");
  redirect(`/admin/clients/${accountId}?notice=${actionMessage("Account member added.")}`);
}

export async function updateClientAccountMember(formData: FormData) {
  const { supabase } = await requireStaff();
  const accountId = field(formData, "account_id", 36);
  const membershipId = field(formData, "membership_id", 36);
  const role = field(formData, "role", 20);
  const activeValue = field(formData, "active", 10);
  if (!uuidPattern.test(accountId) || !uuidPattern.test(membershipId) || !memberRoles.has(role) || !["true", "false"].includes(activeValue)) {
    if (uuidPattern.test(accountId)) redirect(clientErrorPath(accountId, "Review the member role and access state."));
    redirect("/admin/clients?view=clients");
  }

  const { data, error } = await supabase.from("client_account_members")
    .update({ role, active: activeValue === "true" })
    .eq("id", membershipId)
    .eq("client_account_id", accountId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("APRISM client account member update failed", { code: error?.code ?? "membership_not_found" });
    redirect(clientErrorPath(accountId, "The membership could not be updated. Owner or admin access is required."));
  }

  revalidatePath(`/admin/clients/${accountId}`);
  revalidatePath("/portal/business");
  redirect(`/admin/clients/${accountId}?notice=${actionMessage("Member access updated.")}`);
}
