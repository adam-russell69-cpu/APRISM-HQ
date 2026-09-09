import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, ImageIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBillingDate, formatMoney } from "@/lib/billing";
import { InvoiceAttachmentUploader } from "../invoice-attachment-uploader";

export const metadata: Metadata = { title: "Invoice Admin" };

export default async function AdminInvoicePage({ params }: { params: Promise<{ invoiceNumber: string }> }) {
  const { invoiceNumber } = await params;
  const { supabase } = await requireStaff();

  const { data: invoice } = await supabase.from("invoices")
    .select("id, client_account_id, invoice_number, status, issue_date, due_date, subtotal, tax, total, amount_paid, amount_due, currency, notes, client_accounts(display_name)")
    .eq("invoice_number", invoiceNumber)
    .maybeSingle();
  if (!invoice) notFound();

  const [itemsResult, attachmentsResult] = await Promise.all([
    supabase.from("invoice_items").select("id, description, quantity, unit, unit_price, amount, service_date").eq("invoice_id", invoice.id).order("created_at"),
    supabase.from("billing_attachments").select("id, kind, storage_path, file_name, mime_type, size_bytes, client_visible, created_at").eq("invoice_id", invoice.id).order("created_at"),
  ]);

  const admin = createAdminClient();
  const attachments = await Promise.all((attachmentsResult.data ?? []).map(async (item) => {
    if (!admin) return { ...item, signedUrl: null };
    const { data } = await admin.storage.from("billing-attachments").createSignedUrl(item.storage_path, 3600);
    return { ...item, signedUrl: data?.signedUrl ?? null };
  }));

  const clientName = Array.isArray(invoice.client_accounts)
    ? invoice.client_accounts[0]?.display_name
    : invoice.client_accounts?.display_name;

  return <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <Link href="/admin/billing" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ArrowLeft className="size-4" />Billing</Link>
    <AdminPageHeader eyebrow="Invoice record" title={invoice.invoice_number} description={clientName ?? "APRISM client"} actions={<StatusBadge value={invoice.status} />} />

    <section className="mt-6 grid gap-4 sm:grid-cols-4">
      <Metric label="Issued" value={formatBillingDate(invoice.issue_date)} />
      <Metric label="Due" value={formatBillingDate(invoice.due_date)} />
      <Metric label="Total" value={formatMoney(Number(invoice.total), invoice.currency)} />
      <Metric label="Balance" value={formatMoney(Number(invoice.amount_due), invoice.currency)} />
    </section>

    <section className="mt-6 border border-black/10 bg-white">
      <div className="border-b border-black/10 px-5 py-4"><h2 className="font-serif text-2xl">Line items</h2></div>
      <div className="divide-y divide-black/10">{(itemsResult.data ?? []).map((item) => <div key={item.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto]"><div><p className="text-sm font-semibold">{item.description}</p><p className="mt-1 text-xs text-black/40">{item.quantity} {item.unit} × {formatMoney(Number(item.unit_price), invoice.currency)}</p></div><p className="font-semibold">{formatMoney(Number(item.amount), invoice.currency)}</p></div>)}</div>
    </section>

    <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <InvoiceAttachmentUploader invoiceNumber={invoice.invoice_number} />
      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-5 py-4"><h2 className="font-serif text-2xl">Attached files</h2></div>
        {attachments.length ? <div className="divide-y divide-black/10">{attachments.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="flex min-w-0 items-center gap-3">{item.mime_type.startsWith("image/") ? <ImageIcon className="size-4 text-[#87682f]" /> : <FileText className="size-4 text-[#87682f]" />}<div className="min-w-0"><p className="truncate text-sm font-semibold">{item.file_name}</p><p className="mt-1 text-xs text-black/40">{item.kind} · {(Number(item.size_bytes) / 1024 / 1024).toFixed(1)} MB · {item.client_visible ? "Client visible" : "Internal"}</p></div></div>{item.signedUrl ? <a href={item.signedUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 border border-black/15 px-3 text-xs font-semibold"><Download className="size-4" />Open</a> : null}</div>)}</div> : <p className="px-5 py-8 text-sm text-black/45">No attachments yet.</p>}
      </section>
    </div>

    {invoice.notes ? <section className="mt-6 border border-black/10 bg-[#f8f6f0] p-5"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Notes</p><p className="mt-3 text-sm leading-6 text-black/60">{invoice.notes}</p></section> : null}
  </main>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-black/10 bg-white p-4"><p className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-black/35">{label}</p><p className="mt-2 font-serif text-xl">{value}</p></div>;
}
