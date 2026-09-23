import type { Metadata } from "next";
import { Handshake, Phone, Mail } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

export const metadata: Metadata = { title: "Referral Partners" };

export default async function PartnersPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("referral_partners")
    .select("id, company_name, contact_name, category, email, phone, channel, status, tailored_angle, last_touch_at, next_action, next_action_at, referral_count")
    .neq("status", "inactive")
    .order("category")
    .order("company_name");
  const partners = data ?? [];
  const conversations = partners.filter((p) => ["replied","conversation","pilot","referral"].includes(p.status)).length;
  const referrals = partners.reduce((sum, p) => sum + Number(p.referral_count ?? 0), 0);

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <AdminPageHeader eyebrow="Business development" title="Referral Partners" description="Realtors, builders, property managers and private-client insurance relationships. Every target needs a next action." />
    <section className="mt-6 grid gap-3 sm:grid-cols-3">
      {[
        ["Active targets", partners.length],
        ["Conversations", conversations],
        ["Referrals", referrals],
      ].map(([label,value]) => <div key={String(label)} className="border border-black/10 bg-white p-5"><p className="text-xs font-semibold text-black/35">{label}</p><p className="mt-3 font-serif text-3xl">{value}</p></div>)}
    </section>
    <section className="mt-6 overflow-hidden border border-black/10 bg-white">
      <div className="hidden grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_1.6fr] gap-4 border-b border-black/10 bg-[#f8f6f0] px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-black/40 lg:grid">
        <span>Partner</span><span>Category</span><span>Status</span><span>Contact</span><span>Next action</span>
      </div>
      <div className="divide-y divide-black/10">{partners.map((p) => <div key={p.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_1.6fr] lg:items-center">
        <div><p className="font-serif text-xl">{p.company_name}</p><p className="mt-1 text-xs text-black/42">{p.contact_name || "Contact not assigned"}</p><p className="mt-2 text-xs leading-5 text-black/48">{p.tailored_angle}</p></div>
        <p className="text-xs font-semibold capitalize text-black/55">{String(p.category).replace("_"," ")}</p>
        <StatusBadge value={p.status} />
        <div className="space-y-2 text-xs">{p.phone ? <a className="flex items-center gap-2 text-black/55 hover:text-black" href={`tel:${p.phone.split(" / ")[0]}`}><Phone className="size-3.5" />{p.phone}</a> : null}{p.email ? <a className="flex items-center gap-2 break-all text-black/55 hover:text-black" href={`mailto:${p.email}`}><Mail className="size-3.5" />{p.email}</a> : null}<p className="text-black/35">{p.channel}</p></div>
        <div><p className="text-sm font-medium text-black/68">{p.next_action || "Set next action"}</p><p className="mt-1 text-xs text-black/35">{p.next_action_at ? new Date(p.next_action_at).toLocaleDateString("en-US",{timeZone:"America/Denver"}) : "No date set"}</p></div>
      </div>)}</div>
      {!partners.length ? <div className="p-10 text-center"><Handshake className="mx-auto size-7 text-[#87682f]" /><p className="mt-3 font-serif text-2xl">No partner targets yet</p></div> : null}
    </section>
  </main>;
}