"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const field = (formData: FormData, name: string, max = 1000) => String(formData.get(name) ?? "").trim().slice(0, max);
const money = (formData: FormData, name: string) => {
  const value = Number(field(formData, name, 30));
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : null;
};
const qty = (formData: FormData, name: string) => {
  const value = Number(field(formData, name, 30));
  return Number.isFinite(value) && value > 0 ? Math.round(value * 1000) / 1000 : null;
};
const safe = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c] ?? c));
const estimatePath = (number: string, key?: string, value?: string): never => {
  const qs = key ? `?${key}=${encodeURIComponent(value ?? "1")}` : "";
  redirect(`/admin/billing/estimates/${encodeURIComponent(number)}${qs}`);
};

function siteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try { return new URL(raw).origin; } catch { return null; }
}

export async function createEstimate(formData: FormData) {
  const { supabase } = await requireStaff();
  const clientAccountId = field(formData, "client_account_id", 36);
  const issueDate = field(formData, "issue_date", 10);
  const validUntil = field(formData, "valid_until", 10);
  const notes = field(formData, "notes", 2000) || null;
  const laborDescription = field(formData, "labor_description", 1000);
  const laborQty = qty(formData, "labor_qty");
  const laborRate = money(formData, "labor_rate");
  const materialsDescription = field(formData, "materials_description", 1000);
  const materialsAmount = money(formData, "materials_amount");

  if (!uuidPattern.test(clientAccountId) || !/^\d{4}-\d{2}-\d{2}$/.test(issueDate) || !/^\d{4}-\d{2}-\d{2}$/.test(validUntil) || validUntil < issueDate || !laborDescription || laborQty === null || laborRate === null || materialsAmount === null) {
    redirect("/admin/billing/estimates/new?error=Review%20the%20estimate%20fields%20and%20try%20again.");
  }

  const { data: account } = await supabase.from("client_accounts").select("id").eq("id", clientAccountId).maybeSingle();
  if (!account) redirect("/admin/billing/estimates/new?error=Client%20account%20not%20found.");

  const stamp = issueDate.replaceAll("-", "");
  const estimateNumber = `EST-${stamp}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const { data: estimate, error } = await supabase.from("estimates").insert({
    client_account_id: clientAccountId,
    estimate_number: estimateNumber,
    status: "draft",
    issue_date: issueDate,
    valid_until: validUntil,
    currency: "USD",
    notes,
  }).select("id").single();

  if (error || !estimate) redirect("/admin/billing/estimates/new?error=Estimate%20could%20not%20be%20created.");

  const items = [
    { estimate_id: estimate.id, description: laborDescription, quantity: laborQty, unit: "hour", unit_price: laborRate },
    ...(materialsAmount > 0 ? [{ estimate_id: estimate.id, description: materialsDescription || "Materials", quantity: 1, unit: "each", unit_price: materialsAmount }] : []),
  ];
  const { error: itemError } = await supabase.from("estimate_items").insert(items);
  if (itemError) {
    await supabase.from("estimates").delete().eq("id", estimate.id);
    redirect("/admin/billing/estimates/new?error=Estimate%20items%20could%20not%20be%20saved.");
  }

  revalidatePath("/admin/billing");
  return estimatePath(estimateNumber);
}

export async function sendEstimateEmail(formData: FormData) {
  const { supabase } = await requireStaff();
  const estimateNumber = field(formData, "estimateNumber", 64);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const origin = siteOrigin();
  if (!apiKey || !origin) return estimatePath(estimateNumber, "email", "not-configured");

  const { data: estimate } = await supabase.from("estimates")
    .select("id, estimate_number, status, issue_date, valid_until, total, currency, client_accounts(display_name,billing_email,email)")
    .eq("estimate_number", estimateNumber).maybeSingle();
  if (!estimate) return estimatePath(estimateNumber, "email", "not-found");

  const relation = estimate.client_accounts as { display_name: string; billing_email: string | null; email: string | null } | { display_name: string; billing_email: string | null; email: string | null }[] | null;
  const account = Array.isArray(relation) ? relation[0] : relation;
  const recipient = account?.billing_email ?? account?.email ?? null;
  if (!recipient) return estimatePath(estimateNumber, "email", "missing-recipient");

  const total = new Intl.NumberFormat("en-US", { style: "currency", currency: estimate.currency }).format(Number(estimate.total));
  const url = `${origin}/estimate/${estimate.id}`;
  const subject = `APRISM Estimate ${estimate.estimate_number} · ${account?.display_name ?? "Client"}`;
  const text = `APRISM Estimate ${estimate.estimate_number}\nClient: ${account?.display_name ?? "Client"}\nTotal: ${total}\nValid until: ${estimate.valid_until}\n\nReview and approve this estimate: ${url}\n\nThank you,\nAPRISM\nManaging What Matters.`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"></head><body style="margin:0;background-color:#efede7;font-family:Arial,Helvetica,sans-serif;color:#171a19;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding-top:28px;padding-right:16px;padding-bottom:28px;padding-left:16px;"><table width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;"><tr><td bgcolor="#151918" style="background-color:#151918;padding-top:28px;padding-right:32px;padding-bottom:28px;padding-left:32px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;letter-spacing:4px;color:#ffffff;font-weight:700;">APRISM</p><p style="margin-top:8px;margin-right:0;margin-bottom:0;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#d1b477;">ESTIMATE FOR REVIEW</p></td></tr><tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding-top:32px;padding-right:32px;padding-bottom:32px;padding-left:32px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6b6f6c;">Estimate ${safe(estimate.estimate_number)}</p><h1 style="margin-top:8px;margin-right:0;margin-bottom:0;margin-left:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:38px;color:#171a19;font-weight:400;">${safe(account?.display_name ?? "APRISM client")}</h1><p style="margin-top:22px;margin-right:0;margin-bottom:0;margin-left:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:34px;color:#80632d;">${safe(total)}</p><p style="margin-top:8px;margin-right:0;margin-bottom:0;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#777b78;">Valid until ${safe(estimate.valid_until)}</p><table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;"><tr><td bgcolor="#d1b477" style="background-color:#d1b477;"><a href="${safe(url)}" style="display:inline-block;padding-top:14px;padding-right:22px;padding-bottom:14px;padding-left:22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#171a19;text-decoration:none;font-weight:700;letter-spacing:1px;">REVIEW ESTIMATE</a></td></tr></table></td></tr></table></td></tr></table></body></html>`;

  let response: Response | null = null;
  try {
    response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "APRISM <admin@aprismhq.com>", to: [recipient], reply_to: "admin@aprismhq.com", subject, text, html, tags: [{ name: "type", value: "estimate" }, { name: "estimate", value: estimate.estimate_number }] }), cache: "no-store" });
  } catch {
    return estimatePath(estimateNumber, "email", "failed");
  }
  if (!response?.ok) return estimatePath(estimateNumber, "email", "failed");

  if (estimate.status === "draft") await supabase.from("estimates").update({ status: "sent" }).eq("id", estimate.id);
  revalidatePath(`/admin/billing/estimates/${encodeURIComponent(estimateNumber)}`);
  return estimatePath(estimateNumber, "email", "sent");
}

export async function convertEstimateToInvoice(formData: FormData) {
  const { supabase } = await requireStaff();
  const estimateNumber = field(formData, "estimateNumber", 64);
  const { data: estimate } = await supabase.from("estimates")
    .select("id, client_account_id, estimate_number, status, issue_date, notes")
    .eq("estimate_number", estimateNumber).maybeSingle();
  if (!estimate || estimate.status !== "approved") return estimatePath(estimateNumber, "convert", "not-approved");

  const { data: items } = await supabase.from("estimate_items").select("description,quantity,unit,unit_price").eq("estimate_id", estimate.id).order("created_at");
  if (!items?.length) return estimatePath(estimateNumber, "convert", "no-items");

  const today = new Date();
  const issueDate = today.toISOString().slice(0, 10);
  const { data: account } = await supabase.from("client_accounts").select("payment_terms_days").eq("id", estimate.client_account_id).single();
  const due = new Date(`${issueDate}T12:00:00Z`);
  due.setUTCDate(due.getUTCDate() + (account?.payment_terms_days ?? 15));
  const invoiceNumber = `APR-${issueDate.replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

  const { data: invoice, error } = await supabase.from("invoices").insert({ client_account_id: estimate.client_account_id, invoice_number: invoiceNumber, status: "draft", issue_date: issueDate, due_date: due.toISOString().slice(0, 10), payment_terms_days: account?.payment_terms_days ?? 15, currency: "USD", notes: estimate.notes ? `Converted from ${estimate.estimate_number}. ${estimate.notes}` : `Converted from ${estimate.estimate_number}.` }).select("id").single();
  if (error || !invoice) return estimatePath(estimateNumber, "convert", "failed");

  const { error: itemError } = await supabase.from("invoice_items").insert(items.map((item) => ({ invoice_id: invoice.id, description: item.description, quantity: item.quantity, unit: item.unit, unit_price: item.unit_price, service_date: issueDate })));
  if (itemError) {
    await supabase.from("invoices").delete().eq("id", invoice.id);
    return estimatePath(estimateNumber, "convert", "failed");
  }

  await supabase.from("estimates").update({ status: "converted", converted_invoice_id: invoice.id }).eq("id", estimate.id);
  revalidatePath("/admin/billing");
  redirect(`/admin/billing/invoices/${encodeURIComponent(invoiceNumber)}`);
}
