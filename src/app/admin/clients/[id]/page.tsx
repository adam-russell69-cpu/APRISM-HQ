import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, ChevronLeft, FileText, MapPin, ReceiptText, Users, Wrench } from "lucide-react";
import { addClientAccountMember, updateClientAccount, updateClientAccountMember } from "../actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

export const metadata: Metadata = { title: "Client Account" };
const inputClass = "mt-2 min-h-11 w-full border border-black/15 bg-white px-3.5 text-sm outline-none focus:border-[#8f713d]";
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Denver" });

function Message({ error, notice }: { error?: string; notice?: string }) {
  if (error) return <p role="alert" className="mb-5 border border-[#83524d]/30 bg-[#83524d]/10 px-4 py-3 text-sm text-[#71413d]">{error}</p>;
  if (notice) return <p role="status" className="mb-5 border border-[#607568]/30 bg-[#607568]/10 px-4 py-3 text-sm text-[#4d6356]">{notice}</p>;
  return null;
}

export default async function ClientDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; notice?: string }> }) {
  const { id } = await params;
  const message = await searchParams;
  const { supabase } = await requireStaff();
  const { data: account } = await supabase.from("client_accounts")
    .select("id, account_type, display_name, legal_name, email, phone, billing_email, payment_terms_days, status, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (!account) notFound();

  const [membersResult, propertiesResult, locationsResult, workOrdersResult, invoicesResult] = await Promise.all([
    supabase.from("client_account_members").select("id, user_id, role, active, created_at, updated_at").eq("client_account_id", id).order("created_at"),
    supabase.from("properties").select("id, name, city, state, health_status").eq("client_account_id", id).order("name"),
    supabase.from("business_locations").select("id, location_name, city, state, active").eq("client_account_id", id).order("location_name"),
    supabase.from("work_orders").select("id, title, status, priority, created_at").eq("client_account_id", id).order("created_at", { ascending: false }).limit(50),
    supabase.from("invoices").select("id, invoice_number, status, issue_date, due_date, total, amount_due, currency").eq("client_account_id", id).order("issue_date", { ascending: false }).limit(50),
  ]);
  const members = membersResult.data ?? [];
  const properties = propertiesResult.data ?? [];
  const locations = locationsResult.data ?? [];
  const workOrders = workOrdersResult.data ?? [];
  const invoices = invoicesResult.data ?? [];
  const { data: profiles } = members.length
    ? await supabase.from("profiles").select("id, full_name, phone").in("id", members.map((member) => member.user_id))
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const currentBalance = invoices
    .filter((invoice) => !["draft", "void", "cancelled"].includes(invoice.status))
    .reduce((sum, invoice) => sum + Number(invoice.amount_due), 0);

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <Link href="/admin/clients?view=clients" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"><ChevronLeft aria-hidden="true" className="size-4" />All clients</Link>
    <AdminPageHeader eyebrow={`${account.account_type} client`} title={account.display_name} description={`Relationship since ${date.format(new Date(account.created_at))}`} actions={<StatusBadge value={account.status} />} />
    <div className="mt-5"><Message error={message.error} notice={message.notice} /></div>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Client account metrics">
      {[{ label: "Current balance", value: money.format(currentBalance) }, { label: "Members", value: members.length }, { label: "Properties", value: properties.length }, { label: "Locations", value: locations.length }, { label: "Work orders", value: workOrders.length }].map((metric) => <div key={metric.label} className="border border-black/10 bg-white p-5"><p className="text-xs font-semibold text-black/35">{metric.label}</p><p className="mt-3 font-serif text-3xl">{metric.value}</p></div>)}
    </section>

    <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form action={updateClientAccount} className="space-y-5 border border-black/10 bg-[#f8f6f0] p-5 sm:p-6">
        <input type="hidden" name="account_id" value={account.id} />
        <div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Account</p><h2 className="mt-2 font-serif text-3xl">Client details</h2></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-black/55">Display name<input name="display_name" required maxLength={160} defaultValue={account.display_name} className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Legal name<input name="legal_name" maxLength={200} defaultValue={account.legal_name ?? ""} className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Account type<input value={account.account_type} readOnly aria-readonly="true" className={`${inputClass} capitalize text-black/45`} /></label>
          <label className="text-xs font-semibold text-black/55">Status<select name="status" defaultValue={account.status} className={inputClass}><option value="prospect">Prospect</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          <label className="text-xs font-semibold text-black/55">Primary email<input name="email" type="email" maxLength={254} defaultValue={account.email ?? ""} className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Phone<input name="phone" type="tel" maxLength={40} defaultValue={account.phone ?? ""} className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Billing email<input name="billing_email" type="email" maxLength={254} defaultValue={account.billing_email ?? ""} className={inputClass} /></label>
          <label className="text-xs font-semibold text-black/55">Payment terms days<input name="payment_terms_days" type="number" required min={0} max={365} step={1} defaultValue={account.payment_terms_days} className={inputClass} /></label>
        </div>
        <div className="flex justify-end border-t border-black/10 pt-5"><button type="submit" className="min-h-11 bg-[#171a19] px-5 text-xs font-semibold text-white">Save Account</button></div>
      </form>

      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 p-5 sm:p-6"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Portal authorization</p><h2 className="mt-2 font-serif text-3xl">Account members</h2><p className="mt-3 text-sm leading-6 text-black/48">Add only an existing Supabase Auth user ID. Revoking access marks the membership inactive and preserves its history.</p></div>
        {members.length ? <div className="divide-y divide-black/10">{members.map((member) => { const profile = profileMap.get(member.user_id); return <form action={updateClientAccountMember} key={member.id} className="grid gap-4 p-5 md:grid-cols-[minmax(0,1.5fr)_0.7fr_0.7fr_auto] md:items-end"><input type="hidden" name="account_id" value={account.id} /><input type="hidden" name="membership_id" value={member.id} /><div><p className="text-sm font-semibold text-black/70">{profile?.full_name || "Auth user"}</p><p className="mt-1 break-all font-mono text-[0.68rem] text-black/35">{member.user_id}</p>{profile?.phone ? <p className="mt-1 text-xs text-black/40">{profile.phone}</p> : null}</div><label className="text-xs font-semibold text-black/55">Role<select name="role" defaultValue={member.role} className={inputClass}><option value="owner">Owner</option><option value="manager">Manager</option><option value="billing">Billing</option><option value="member">Member</option></select></label><label className="text-xs font-semibold text-black/55">Access<select name="active" defaultValue={String(member.active)} className={inputClass}><option value="true">Active</option><option value="false">Inactive</option></select></label><button type="submit" className="min-h-11 border border-black/15 px-4 text-xs font-semibold">Update</button></form>; })}</div> : <EmptyState icon={Users} title="No account members" description="Portal access has not been provisioned for this client." />}
        <form action={addClientAccountMember} className="border-t border-black/10 bg-[#f8f6f0] p-5 sm:p-6"><input type="hidden" name="account_id" value={account.id} /><h3 className="font-serif text-2xl">Add existing Auth user</h3><div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_0.45fr_auto] md:items-end"><label className="text-xs font-semibold text-black/55">Supabase Auth user ID<input name="user_id" required maxLength={36} placeholder="00000000-0000-0000-0000-000000000000" className={`${inputClass} font-mono`} /></label><label className="text-xs font-semibold text-black/55">Role<select name="role" defaultValue="member" className={inputClass}><option value="owner">Owner</option><option value="manager">Manager</option><option value="billing">Billing</option><option value="member">Member</option></select></label><button type="submit" className="min-h-11 bg-[#171a19] px-5 text-xs font-semibold text-white">Add Member</button></div></form>
      </section>
    </div>

    <section className="mt-6 grid gap-6 xl:grid-cols-2">
      <RelatedPanel title="Properties" icon={Building2}>{properties.length ? properties.map((property) => <Link key={property.id} href={`/admin/properties/${property.id}`} className="flex items-center justify-between gap-4 border-t border-black/10 px-5 py-4 first:border-t-0"><div><p className="text-sm font-semibold">{property.name}</p><p className="mt-1 text-xs text-black/40">{property.city}, {property.state}</p></div><StatusBadge value={property.health_status} /></Link>) : <EmptyState icon={Building2} title="No properties" description="No property records are linked to this account." />}</RelatedPanel>
      <RelatedPanel title="Business locations" icon={MapPin}>{locations.length ? locations.map((location) => <div key={location.id} className="flex items-center justify-between gap-4 border-t border-black/10 px-5 py-4 first:border-t-0"><div><p className="text-sm font-semibold">{location.location_name}</p><p className="mt-1 text-xs text-black/40">{[location.city, location.state].filter(Boolean).join(", ") || "Address not recorded"}</p></div><StatusBadge value={location.active ? "active" : "inactive"} /></div>) : <EmptyState icon={MapPin} title="No business locations" description="No service locations are linked to this account." />}</RelatedPanel>
      <RelatedPanel title="Work orders" icon={Wrench}>{workOrders.length ? workOrders.map((workOrder) => <div key={workOrder.id} className="flex items-center justify-between gap-4 border-t border-black/10 px-5 py-4 first:border-t-0"><div><p className="text-sm font-semibold">{workOrder.title}</p><p className="mt-1 text-xs text-black/40">Created {date.format(new Date(workOrder.created_at))} · {workOrder.priority}</p></div><StatusBadge value={workOrder.status} /></div>) : <EmptyState icon={Wrench} title="No work orders" description="No work orders are linked to this account." />}</RelatedPanel>
      <RelatedPanel title="Invoices" icon={ReceiptText}>{invoices.length ? invoices.map((invoice) => <Link key={invoice.id} href={`/portal/invoices/${encodeURIComponent(invoice.invoice_number)}`} className="grid grid-cols-[1fr_auto] gap-3 border-t border-black/10 px-5 py-4 first:border-t-0"><div><p className="text-sm font-semibold">{invoice.invoice_number}</p><p className="mt-1 text-xs text-black/40">Due {invoice.due_date} · Total {money.format(Number(invoice.total))}</p></div><div className="text-right"><StatusBadge value={invoice.status} /><p className="mt-2 text-sm font-semibold">{money.format(Number(invoice.amount_due))}</p></div></Link>) : <EmptyState icon={FileText} title="No invoices" description="No invoices are linked to this account." />}</RelatedPanel>
    </section>
  </main>;
}

function RelatedPanel({ title, icon: Icon, children }: { title: string; icon: typeof Building2; children: React.ReactNode }) {
  return <section className="border border-black/10 bg-white"><div className="flex items-center gap-3 border-b border-black/10 px-5 py-4"><Icon aria-hidden="true" className="size-5 text-[#8c6d36]" /><h2 className="font-serif text-2xl">{title}</h2></div>{children}</section>;
}
