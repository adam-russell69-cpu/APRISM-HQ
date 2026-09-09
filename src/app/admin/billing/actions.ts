"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const field = (formData: FormData, name: string, max = 500) => String(formData.get(name) ?? "").trim().slice(0, max);
const message = (value: string) => encodeURIComponent(value);

function money(formData: FormData, name: string) {
  const value = Number(field(formData, name, 20));
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : null;
}

export async function createInvoice(formData: FormData) {
  const { supabase } = await requireStaff();
  const accountId = field(formData, "client_account_id", 36);
  const invoiceNumber = field(formData, "invoice_number", 64);
  const issueDate = field(formData, "issue_date", 10);
  const dueDate = field(formData, "due_date", 10);
  const notes = field(formData, "notes", 2000) || null;
  const laborDescription = field(formData, "labor_description", 1000);
  const laborHours = money(formData, "labor_hours");
  const laborRate = money(formData, "labor_rate");
  const materialsDescription = field(formData, "materials_description", 1000);
  const materialsAmount = money(formData, "materials_amount");

  if (!uuidPattern.test(accountId) || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(invoiceNumber) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(issueDate) || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
      dueDate < issueDate || laborHours === null || laborHours <= 0 || laborRate === null ||
      materialsAmount === null || !laborDescription) {
    redirect(`/admin/clients/${accountId}?error=${message("Review the invoice fields and submit again.")}`);
  }

  const { data: account } = await supabase.from("client_accounts")
    .select("id, payment_terms_days").eq("id", accountId).maybeSingle();
  if (!account) redirect("/admin/clients?view=clients");

  const { data: invoice, error: invoiceError } = await supabase.from("invoices").insert({
    client_account_id: accountId,
    invoice_number: invoiceNumber,
    status: "sent",
    issue_date: issueDate,
    due_date: dueDate,
    payment_terms_days: account.payment_terms_days,
    notes,
    currency: "USD",
  }).select("id").single();

  if (invoiceError || !invoice) {
    console.error("APRISM invoice create failed", { code: invoiceError?.code ?? "missing_invoice_id" });
    redirect(`/admin/clients/${accountId}?error=${message(invoiceError?.code === "23505" ? "That invoice number already exists." : "Invoice could not be created.")}`);
  }

  const items = [
    {
      invoice_id: invoice.id,
      description: laborDescription,
      quantity: laborHours,
      unit: "hour",
      unit_price: laborRate,
      service_date: issueDate,
    },
    ...(materialsAmount > 0 ? [{
      invoice_id: invoice.id,
      description: materialsDescription || "Materials reimbursement",
      quantity: 1,
      unit: "each",
      unit_price: materialsAmount,
      service_date: issueDate,
    }] : []),
  ];

  const { error: itemError } = await supabase.from("invoice_items").insert(items);
  if (itemError) {
    console.error("APRISM invoice item create failed", { code: itemError.code });
    await supabase.from("invoices").delete().eq("id", invoice.id);
    redirect(`/admin/clients/${accountId}?error=${message("Invoice items could not be saved. No invoice was retained.")}`);
  }

  revalidatePath("/admin/billing");
  revalidatePath(`/admin/clients/${accountId}`);
  revalidatePath("/portal/invoices");
  redirect(`/portal/invoices/${encodeURIComponent(invoiceNumber)}`);
}
