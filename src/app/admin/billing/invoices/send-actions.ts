"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";

const invoicePattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function invoicePath(invoiceNumber: string, status: string, recipient?: string): never {
  const params = new URLSearchParams({ email: status });
  if (recipient) params.set("to", recipient);
  redirect(`/admin/billing/invoices/${encodeURIComponent(invoiceNumber)}?${params.toString()}`);
}

function siteOrigin() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function money(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value));
}

function safe(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character] ?? character));
}

export async function sendInvoiceEmail(formData: FormData) {
  const invoiceNumber = String(formData.get("invoiceNumber") ?? "").trim();
  if (!invoicePattern.test(invoiceNumber)) redirect("/admin/billing");

  const { supabase } = await requireStaff();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const origin = siteOrigin();
  if (!apiKey || !origin) invoicePath(invoiceNumber, "not-configured");

  const { data: invoice, error } = await supabase.from("invoices")
    .select("id, invoice_number, status, due_date, total, amount_due, currency, client_accounts(display_name, billing_email, email)")
    .eq("invoice_number", invoiceNumber)
    .maybeSingle();

  if (error || !invoice) invoicePath(invoiceNumber, "not-found");

  const relation = invoice.client_accounts as {
    display_name: string;
    billing_email: string | null;
    email: string | null;
  } | {
    display_name: string;
    billing_email: string | null;
    email: string | null;
  }[] | null;
  const account = Array.isArray(relation) ? relation[0] : relation;
  const recipient = account?.billing_email ?? account?.email ?? null;
  if (!recipient || !emailPattern.test(recipient)) invoicePath(invoiceNumber, "missing-recipient");

  const paymentUrl = `${origin}/pay/${invoice.id}`;
  const clientName = account?.display_name ?? "APRISM client";
  const amountDue = money(invoice.amount_due, invoice.currency);
  const total = money(invoice.total, invoice.currency);
  const subject = `APRISM Invoice ${invoice.invoice_number} · ${clientName}`;
  const text = [
    `APRISM Invoice ${invoice.invoice_number}`,
    `Client: ${clientName}`,
    `Invoice total: ${total}`,
    `Balance due: ${amountDue}`,
    `Due date: ${invoice.due_date}`,
    "",
    `View and securely pay this invoice: ${paymentUrl}`,
    "",
    "ACH / bank account is preferred. Credit and debit cards are also accepted.",
    "",
    "Thank you,",
    "APRISM",
    "Managing What Matters.",
  ].join("\n");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"></head><body style="margin:0;background-color:#efede7;font-family:Arial,Helvetica,sans-serif;color:#171a19;"><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td align="center" style="padding-top:28px;padding-right:16px;padding-bottom:28px;padding-left:16px;"><table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;max-width:600px;"><tr><td bgcolor="#151918" style="background-color:#151918;padding-top:28px;padding-right:32px;padding-bottom:28px;padding-left:32px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;letter-spacing:4px;color:#ffffff;font-weight:700;">APRISM</p><p style="margin-top:8px;margin-right:0;margin-bottom:0;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;letter-spacing:2px;color:#d1b477;font-weight:700;">MANAGING WHAT MATTERS.</p></td></tr><tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding-top:32px;padding-right:32px;padding-bottom:32px;padding-left:32px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6b6f6c;">Invoice ${safe(invoice.invoice_number)}</p><h1 style="margin-top:8px;margin-right:0;margin-bottom:0;margin-left:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:38px;color:#171a19;font-weight:400;">${safe(clientName)}</h1><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-top:26px;border-top:1px solid #e2e0da;"><tr><td style="padding-top:18px;padding-right:0;padding-bottom:8px;padding-left:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6b6f6c;">Invoice total</td><td align="right" style="padding-top:18px;padding-right:0;padding-bottom:8px;padding-left:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#171a19;font-weight:700;">${safe(total)}</td></tr><tr><td style="padding-top:8px;padding-right:0;padding-bottom:8px;padding-left:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6b6f6c;">Balance due</td><td align="right" style="padding-top:8px;padding-right:0;padding-bottom:8px;padding-left:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:30px;color:#80632d;">${safe(amountDue)}</td></tr><tr><td style="padding-top:8px;padding-right:0;padding-bottom:18px;padding-left:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6b6f6c;">Due date</td><td align="right" style="padding-top:8px;padding-right:0;padding-bottom:18px;padding-left:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#171a19;">${safe(invoice.due_date)}</td></tr></table><table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-top:22px;"><tr><td bgcolor="#d1b477" style="background-color:#d1b477;"><a href="${safe(paymentUrl)}" style="display:inline-block;padding-top:14px;padding-right:22px;padding-bottom:14px;padding-left:22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#171a19;text-decoration:none;font-weight:700;letter-spacing:1px;">VIEW &amp; PAY INVOICE</a></td></tr></table><p style="margin-top:24px;margin-right:0;margin-bottom:0;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#777b78;">ACH / bank account is preferred. Credit and debit cards are also accepted securely through Stripe.</p></td></tr></table></td></tr></table></body></html>`;

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "APRISM <admin@aprismhq.com>",
        to: [recipient],
        reply_to: "admin@aprismhq.com",
        subject,
        text,
        html,
        tags: [
          { name: "type", value: "invoice" },
          { name: "invoice", value: invoice.invoice_number },
        ],
      }),
      cache: "no-store",
    });
  } catch (sendError) {
    console.error("[invoice-email] Resend request failed", { invoiceNumber, message: sendError instanceof Error ? sendError.message : "Unknown email error" });
    invoicePath(invoiceNumber, "failed");
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[invoice-email] Resend rejected invoice email", { invoiceNumber, status: response.status, detail: detail.slice(0, 300) });
    invoicePath(invoiceNumber, response.status === 401 ? "not-configured" : "failed");
  }

  const { error: statusError } = await supabase.from("invoices")
    .update({ status: "sent" })
    .eq("id", invoice.id)
    .eq("status", "draft");

  if (statusError) {
    console.error("[invoice-email] Invoice sent but status update failed", { invoiceNumber, code: statusError.code });
  }

  revalidatePath("/admin/billing");
  revalidatePath(`/admin/billing/invoices/${encodeURIComponent(invoiceNumber)}`);
  revalidatePath("/portal/invoices");
  invoicePath(invoiceNumber, "sent", recipient);
}
