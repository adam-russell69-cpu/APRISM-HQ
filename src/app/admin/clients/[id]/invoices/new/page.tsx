import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/lib/admin-account";
import { createInvoice } from "../../actions";

export const metadata: Metadata = { title: "New Invoice" };
const input = "mt-2 min-h-11 w-full border border-black/15 bg-white px-3.5 text-sm outline-none focus:border-[#8f713d]";

export default async function NewClientInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: account } = await supabase.from("client_accounts")
    .select("id, display_name, payment_terms_days").eq("id", id).maybeSingle();
  if (!account) notFound();

  const issueDate = new Date().toISOString().slice(0, 10);
  const due = new Date(`${issueDate}T12:00:00Z`);
  due.setUTCDate(due.getUTCDate() + account.payment_terms_days);
  const dueDate = due.toISOString().slice(0, 10);
  const suggestedNumber = `APR-${issueDate.replaceAll("-", "")}-${account.id.slice(0, 4).toUpperCase()}`;

  return <main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <Link href={`/admin/clients/${account.id}`} className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ChevronLeft className="size-4" />{account.display_name}</Link>
    <AdminPageHeader eyebrow="Accounts receivable" title="New Invoice" description={`Create an APRISM invoice for ${account.display_name}. Amounts are recalculated by the billing ledger from invoice items.`} />
    <form action={createInvoice} className="mt-6 space-y-6 border border-black/10 bg-[#f8f6f0] p-5 sm:p-7">
      <input type="hidden" name="client_account_id" value={account.id} />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-xs font-semibold text-black/55">Invoice number<input name="invoice_number" required defaultValue={suggestedNumber} className={input} /></label>
        <label className="text-xs font-semibold text-black/55">Issue date<input name="issue_date" type="date" required defaultValue={issueDate} className={input} /></label>
        <label className="text-xs font-semibold text-black/55">Due date<input name="due_date" type="date" required defaultValue={dueDate} className={input} /></label>
      </div>
      <section className="border-t border-black/10 pt-5"><h2 className="font-serif text-2xl">Labor</h2>
        <label className="mt-4 block text-xs font-semibold text-black/55">Description<textarea name="labor_description" required rows={4} defaultValue="Property Repair Assessment & Minor Repairs. Completed approved post-move-in repair list including door hardware/lock repairs, dryer vent repair and exterior sealing, plumbing fixture repairs, cabinet/hardware adjustments, lighting repairs, HVAC condenser cleaning and associated minor corrective maintenance." className={`${input} py-3`} /></label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-black/55">Hours<input name="labor_hours" type="number" min="0.001" step="0.001" required defaultValue="5" className={input} /></label><label className="text-xs font-semibold text-black/55">Hourly rate<input name="labor_rate" type="number" min="0" step="0.01" required defaultValue="55.00" className={input} /></label></div>
      </section>
      <section className="border-t border-black/10 pt-5"><h2 className="font-serif text-2xl">Materials</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_0.35fr]"><label className="text-xs font-semibold text-black/55">Description<input name="materials_description" defaultValue="Materials reimbursement — Timberline Ace Hardware receipt dated 09/08/2026" className={input} /></label><label className="text-xs font-semibold text-black/55">Amount<input name="materials_amount" type="number" min="0" step="0.01" required defaultValue="151.13" className={input} /></label></div>
      </section>
      <label className="block border-t border-black/10 pt-5 text-xs font-semibold text-black/55">Notes<textarea name="notes" rows={4} defaultValue="Approved repair list completed except window-well covers and window/door screens. Those items require separate pricing and will be submitted under a separate estimate before work proceeds." className={`${input} py-3`} /></label>
      <div className="flex items-center justify-between border-t border-black/10 pt-5"><p className="text-sm text-black/50">Expected total: <strong className="text-black">$426.13</strong> · Net {account.payment_terms_days}</p><button type="submit" className="min-h-11 bg-[#171a19] px-6 text-xs font-semibold text-white">Create Invoice</button></div>
    </form>
  </main>;
}
