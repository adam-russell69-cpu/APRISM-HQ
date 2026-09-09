"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin-account";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const maxBytes = 10 * 1024 * 1024;
const invoicePattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

function safeName(name: string) {
  return name.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "attachment";
}

export async function createAttachmentUpload(input: {
  invoiceNumber: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const { supabase } = await requireStaff();
  if (!invoicePattern.test(input.invoiceNumber) || !allowedTypes.has(input.mimeType) || !Number.isInteger(input.sizeBytes) || input.sizeBytes <= 0 || input.sizeBytes > maxBytes) {
    throw new Error("Unsupported attachment. Use JPG, PNG, WEBP, or PDF up to 10 MB.");
  }

  const { data: invoice } = await supabase.from("invoices")
    .select("id, client_account_id")
    .eq("invoice_number", input.invoiceNumber)
    .maybeSingle();
  if (!invoice) throw new Error("Invoice not found.");

  const admin = createAdminClient();
  if (!admin) throw new Error("Secure attachment storage is not configured.");

  const path = `${invoice.client_account_id}/${invoice.id}/${crypto.randomUUID()}-${safeName(input.fileName)}`;
  const { data, error } = await admin.storage.from("billing-attachments").createSignedUploadUrl(path);
  if (error || !data?.token) throw new Error("Could not prepare secure upload.");

  return { path, token: data.token, invoiceId: invoice.id, clientAccountId: invoice.client_account_id };
}

export async function registerAttachment(input: {
  invoiceNumber: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  kind: "photo" | "receipt" | "document" | "other";
  clientVisible: boolean;
}) {
  const { supabase, account } = await requireStaff();
  if (!invoicePattern.test(input.invoiceNumber) || !allowedTypes.has(input.mimeType) || input.sizeBytes <= 0 || input.sizeBytes > maxBytes) {
    throw new Error("Invalid attachment metadata.");
  }

  const { data: invoice } = await supabase.from("invoices")
    .select("id, client_account_id")
    .eq("invoice_number", input.invoiceNumber)
    .maybeSingle();
  if (!invoice) throw new Error("Invoice not found.");

  const expectedPrefix = `${invoice.client_account_id}/${invoice.id}/`;
  if (!input.storagePath.startsWith(expectedPrefix)) throw new Error("Attachment path does not match this invoice.");

  const admin = createAdminClient();
  if (!admin) throw new Error("Secure attachment storage is not configured.");

  const { error } = await admin.from("billing_attachments").insert({
    client_account_id: invoice.client_account_id,
    invoice_id: invoice.id,
    kind: input.kind,
    storage_path: input.storagePath,
    file_name: safeName(input.fileName),
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
    client_visible: input.clientVisible,
    created_by: account.userId,
  });
  if (error) throw new Error("Attachment uploaded but could not be linked to the invoice.");

  revalidatePath(`/admin/billing/invoices/${encodeURIComponent(input.invoiceNumber)}`);
  revalidatePath(`/portal/invoices/${encodeURIComponent(input.invoiceNumber)}`);
  return { success: true };
}
