import type { Metadata } from "next";
import { ArrowRight, BriefcaseBusiness, CreditCard, FileWarning, ReceiptText, WalletCards } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableRow, MobileLabel } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";
import { formatMoney } from "@/lib/billing";

export const metadata: Metadata = { title: "Billing" };
type Relation<T> = T | T[] | null;

function firstRelation<T>(value: Relation<T>): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Denver" });

export default async function AdminBillingPage() {
  const { supabase } = await requireStaff();
  const [accountsResult, locationsResult, workOrdersResult, invoicesResult, paymentsResult] = await Promise.all([
    supabase.from("client_accounts").select("id, account_type, display_name, payment_terms_days, status").order("display_name"),
    supabase.from("business_locations").select("id, active"),
    supabase.from("work_orders").select("id, title, status, priority, scheduled_at, client_accounts(display_name), business_locations(location_name)").order("created_at", { ascending: false }).limit(8),
    supabase.from("invoices").select("id, invoice_number, status, issue_date, due_date, total, amount_paid, amount_due, currency, client_accounts(display_name)").order("issue_date", { ascending: false }).limit(100),
    supabase.from("payments").select("id, amount, currency, payment_method, status, paid_at, created_at, invoices(invoice_number), client_accounts(display_name)").order("created_at", { ascending: false }).limit(8),
  ]);
  const accounts = accountsResult.data ?? [];
  const workOrders = workOrdersResult.data ?? [];
  const invoices = invoicesResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const outstanding = invoices.filter((invoice) => Number(invoice.amount_due) > 0 && !["draft", "void", "cancelled"].includes(invoice.status));
  const overdue = invoices.filter((invoice) => invoice.status === "overdue" || (Number(invoice.amount_due) > 0 && invoice.due_date < new Date().toISOString().slice(0, 10) && !["draft", "void", "cancelled", "paid"].includes(invoice.status)));
  const outstandingBalance = outstanding.reduce((sum, invoice) => sum + Number(invoice.amount_due), 0);
  const dataError = [accountsResult, locationsResult, workOrdersResult, invoicesResult, paymentsResult].some((result) => result.error);

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <AdminPageHeader eyebrow="Revenue operations" title="Client Billing" description="The internal record for client accounts, business work, invoices, outstanding balances, and verified payment status." />
    {dataError ? <div role="alert" className="mt-6 border border-[#955047]/25 bg-[#955047]/8 px-5 py-4 text-sm text-[#793e38]">Some billing records could not be loaded. Confirm the latest Supabase migration is applied.</div> : null}
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {[
        { label: "Client accounts", value: accounts.length, detail: `${accounts.filter((account) => account.account_type === "business").length} business`, icon: BriefcaseBusiness },
        { label: "Active locations", value: (locationsResult.data ?? []).filter((location) => location.active).length, detail: "Business service locations", icon: WalletCards },
        { label: "Open work orders", value: workOrders.filter((order) => !["completed", "cancelled", "invoiced"].includes(order.status)).length, detail: "Recent operating queue", icon: CreditCard },
        { label: "Outstanding", value: formatMoney(outstandingBalance), detail: `${outstanding.length} invoices`, icon: ReceiptText },
        { label: "Overdue", value: overdue.length, detail: overdue.length ? "Requires follow-up" : "No overdue balances", icon: FileWarning },
      ].map(({ label, value, detail, icon: Icon }) => <article key={label} className="border border-black/10 bg-white p-5"><Icon aria-hidden="true" className="size-4 text-[#8b6a31]" /><p className="mt-5 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-black/38">{label}</p><p className="mt-2 font-serif text-3xl">{value}</p><p className="mt-2 text-xs text-black/40">{detail}</p></article>)}
    </section>
    <section className="mt-7"><div className="mb-3 flex items-end justify-between gap-4"><div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[#88682f]">Accounts receivable</p><h2 className="mt-1 font-serif text-3xl">Invoices</h2></div></div>
      {invoices.length ? <AdminTable columns={["Invoice", "Client", "Dates", "Status", "Total", "Balance"]}>{invoices.map((invoice) => { const account = firstRelation(invoice.client_accounts as Relation<{ display_name: string }>); return <AdminTableRow key={invoice.id} columns={6}><div><MobileLabel>Invoice</MobileLabel><Link href={`/admin/billing/invoices/${encodeURIComponent(invoice.invoice_number)}`} className="font-semibold text-[#765a29] hover:underline">{invoice.invoice_number}</Link></div><div><MobileLabel>Client</MobileLabel><p className="font-medium text-black/70">{account?.display_name ?? "Client account"}</p></div><div><MobileLabel>Dates</MobileLabel><p className="text-xs text-black/55">Issued {dateFormatter.format(new Date(`${invoice.issue_date}T12:00:00Z`))}</p><p className="mt-1 text-xs text-black/38">Due {dateFormatter.format(new Date(`${invoice.due_date}T12:00:00Z`))}</p></div><div><MobileLabel>Status</MobileLabel><StatusBadge value={invoice.status} /></div><div><MobileLabel>Total</MobileLabel>{formatMoney(Number(invoice.total), invoice.currency)}</div><div className="flex items-center justify-between gap-3"><div><MobileLabel>Balance</MobileLabel><p className="font-semibold">{formatMoney(Number(invoice.amount_due), invoice.currency)}</p></div><ArrowRight aria-hidden="true" className="size-4 text-black/25" /></div></AdminTableRow>; })}</AdminTable> : <div className="border border-black/10 bg-white"><EmptyState icon={ReceiptText} title="No invoices" description="Draft and issued client invoices will appear here." /></div>}
    </section>
    <div className="mt-7 grid gap-7 xl:grid-cols-2">
      <section><div className="mb-3"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[#88682f]">Operations</p><h2 className="mt-1 font-serif text-3xl">Recent work orders</h2></div>{workOrders.length ? <div className="divide-y divide-black/10 border border-black/10 bg-white">{workOrders.map((order) => { const account = firstRelation(order.client_accounts as Relation<{ display_name: string }>); const location = firstRelation(order.business_locations as Relation<{ location_name: string }>); return <div key={order.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><StatusBadge value={order.status} /><p className="mt-2 text-sm font-semibold">{order.title}</p><p className="mt-1 text-xs text-black/38">{account?.display_name ?? "Client"}{location ? ` · ${location.location_name}` : ""}</p></div><span className="text-[0.6rem] uppercase tracking-[0.12em] text-black/35">{order.priority}</span></div>; })}</div> : <div className="border border-black/10 bg-white"><EmptyState icon={CreditCard} title="No work orders" description="Client-account work orders will appear here." /></div>}</section>
      <section><div className="mb-3"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[#88682f]">Stripe record</p><h2 className="mt-1 font-serif text-3xl">Recent payments</h2></div>{payments.length ? <div className="divide-y divide-black/10 border border-black/10 bg-white">{payments.map((payment) => { const invoice = firstRelation(payment.invoices as Relation<{ invoice_number: string }>); const account = firstRelation(payment.client_accounts as Relation<{ display_name: string }>); return <div key={payment.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><StatusBadge value={payment.status} /><p className="mt-2 text-sm font-semibold">{account?.display_name ?? "Client"}</p><p className="mt-1 text-xs text-black/38">{invoice?.invoice_number ?? "Invoice"} · {payment.payment_method}</p></div><div className="text-right"><p className="font-serif text-xl">{formatMoney(Number(payment.amount), payment.currency)}</p><p className="mt-1 text-xs text-black/35">{dateFormatter.format(new Date(payment.paid_at ?? payment.created_at))}</p></div></div>; })}</div> : <div className="border border-black/10 bg-white"><EmptyState icon={WalletCards} title="No payments recorded" description="Only verified payment events create or update payment records." /></div>}</section>
    </div>
  </main>;
}
