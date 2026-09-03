import type { Metadata } from "next";
import Link from "next/link";
import { UserRoundSearch, Users } from "lucide-react";
import { updateInquiryStatus } from "@/app/admin/actions";
import { ActionMenu, actionMenuItem } from "@/components/admin/action-menu";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableRow, MobileLabel } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

export const metadata: Metadata = { title: "Clients & Leads" };
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Denver" });
const leadStatuses = ["new", "contacted", "qualified", "closed"] as const;

function nextLeadAction(status: string) {
  if (status === "new") return "Make first contact";
  if (status === "contacted") return "Qualify opportunity";
  if (status === "qualified") return "Schedule assessment";
  return "View record";
}

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const view = (await searchParams).view === "clients" ? "clients" : "leads";
  const { supabase } = await requireStaff();
  const [{ data: inquiries }, { data: accounts }, { data: properties }] = await Promise.all([
    supabase.from("inquiries").select("id, name, property_location, property_type, services, status, created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("client_accounts").select("id, account_type, display_name, billing_email, payment_terms_days, status, created_at").order("display_name"),
    supabase.from("properties").select("id, client_account_id"),
  ]);
  const propertyCountByAccount = new Map<string, number>();
  for (const property of properties ?? []) {
    if (property.client_account_id) propertyCountByAccount.set(property.client_account_id, (propertyCountByAccount.get(property.client_account_id) ?? 0) + 1);
  }

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><AdminPageHeader eyebrow="Relationships" title="Clients & Leads" description="Move prospective clients toward a thoughtful assessment while keeping active property relationships visible." />
    <nav className="mt-6 flex gap-1 border-b border-black/10" aria-label="Client and lead views"><Link href="/admin/clients?view=leads" className={`border-b-2 px-4 py-3 text-sm font-semibold ${view === "leads" ? "border-[#9a793e] text-black" : "border-transparent text-black/40"}`}>Leads <span className="ml-2 text-xs font-normal text-black/30">{inquiries?.length ?? 0}</span></Link><Link href="/admin/clients?view=clients" className={`border-b-2 px-4 py-3 text-sm font-semibold ${view === "clients" ? "border-[#9a793e] text-black" : "border-transparent text-black/40"}`}>Clients <span className="ml-2 text-xs font-normal text-black/30">{accounts?.length ?? 0}</span></Link></nav>
    <section className="mt-5">{view === "leads" ? (inquiries?.length ? <AdminTable columns={["Name", "Property / location", "Interest", "Status", "Received", "Next action"]}>{inquiries.map((lead) => <AdminTableRow key={lead.id} columns={6}><div><MobileLabel>Name</MobileLabel><Link href={`/admin/clients/leads/${lead.id}`} className="font-semibold text-black/72 hover:underline">{lead.name}</Link></div><div><MobileLabel>Property / location</MobileLabel><p className="text-black/58">{lead.property_location}</p><p className="mt-1 text-xs text-black/34">{lead.property_type}</p></div><div><MobileLabel>Interest</MobileLabel><p className="text-xs leading-5 text-black/55">{lead.services.join(" · ")}</p></div><div><MobileLabel>Status</MobileLabel><StatusBadge value={lead.status} /></div><div><MobileLabel>Received</MobileLabel><p className="text-black/42">{dateFormatter.format(new Date(lead.created_at))}</p></div><div className="flex items-center justify-between gap-2"><div><MobileLabel>Next action</MobileLabel><Link href={`/admin/clients/leads/${lead.id}`} className="text-xs font-semibold text-[#765a29]">{nextLeadAction(lead.status)}</Link></div><ActionMenu label={`Update ${lead.name}`}><Link href={`/admin/clients/leads/${lead.id}`} className={actionMenuItem}>View lead</Link>{leadStatuses.filter((status) => status !== lead.status).map((status) => <form action={updateInquiryStatus} key={status}><input type="hidden" name="id" value={lead.id} /><input type="hidden" name="status" value={status} /><button type="submit" className={actionMenuItem}>Mark {status}</button></form>)}</ActionMenu></div></AdminTableRow>)}</AdminTable> : <div className="border border-black/10 bg-white"><EmptyState icon={UserRoundSearch} title="No leads yet" description="New property assessment inquiries will appear here." /></div>) : (accounts?.length ? <AdminTable columns={["Client account", "Type", "Properties", "Terms", "Status", "Relationship since"]}>{accounts.map((account) => <AdminTableRow key={account.id} columns={6}><div><MobileLabel>Client account</MobileLabel><p className="font-semibold text-black/70">{account.display_name}</p><p className="mt-1 text-xs text-black/34">{account.billing_email ?? "Billing contact not set"}</p></div><div><MobileLabel>Type</MobileLabel><StatusBadge value={account.account_type} /></div><div><MobileLabel>Properties</MobileLabel><p>{propertyCountByAccount.get(account.id) ?? 0}</p></div><div><MobileLabel>Terms</MobileLabel><p>Net {account.payment_terms_days}</p></div><div><MobileLabel>Status</MobileLabel><StatusBadge value={account.status} /></div><div><MobileLabel>Relationship since</MobileLabel>{dateFormatter.format(new Date(account.created_at))}</div></AdminTableRow>)}</AdminTable> : <div className="border border-black/10 bg-white"><EmptyState icon={Users} title="No client accounts" description="Private and business relationships appear when a client account is provisioned." /></div>)}</section>
  </main>;
}
