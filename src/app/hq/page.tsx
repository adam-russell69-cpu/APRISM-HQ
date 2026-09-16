import Link from "next/link";
import { requireStaff } from "@/lib/admin-account";

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "2-digit", hour12: false, timeZone: "America/Denver" }).format(new Date()));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function TodayPage() {
  const { supabase, account } = await requireStaff();
  const [propertyResult, requestResult, issueResult, motoResult] = await Promise.all([
    supabase.from("properties").select("id, name, city, state").order("updated_at", { ascending: false }).limit(50),
    supabase.from("service_requests").select("id, property_id, title, category, status, updated_at").order("updated_at", { ascending: false }).limit(50),
    supabase.from("issues").select("id, property_id, title, severity, status, updated_at").order("updated_at", { ascending: false }).limit(50),
    supabase.from("repair_orders").select("id, ro_number, status, customer_concern, service_type, updated_at, motorcycles(year, make, model), client_accounts(name)").order("updated_at", { ascending: false }).limit(30),
  ]);

  const properties = propertyResult.data ?? [];
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const activeRequests = (requestResult.data ?? []).filter((request) => !["completed", "cancelled"].includes(request.status));
  const activeIssues = (issueResult.data ?? []).filter((issue) => !["resolved", "closed"].includes(issue.status));
  const activeMoto = (motoResult.data ?? []).filter((ro) => !["Completed", "Cancelled", "completed", "cancelled"].includes(ro.status));

  const work = [
    ...activeRequests.map((request) => ({
      key: `property-${request.id}`,
      href: `/admin/requests/${request.id}`,
      module: "Property",
      title: request.title,
      detail: propertyNames.get(request.property_id) ?? request.category ?? "Property service",
      status: request.status,
      updated: request.updated_at,
    })),
    ...activeMoto.map((ro) => {
      const bike = Array.isArray(ro.motorcycles) ? ro.motorcycles[0] : ro.motorcycles;
      const customer = Array.isArray(ro.client_accounts) ? ro.client_accounts[0] : ro.client_accounts;
      return {
        key: `moto-${ro.id}`,
        href: `/hq/moto/ro/${ro.id}`,
        module: "Moto",
        title: customer?.name || ro.service_type || `RO ${ro.ro_number ?? ""}`.trim(),
        detail: bike ? `${bike.year ?? ""} ${bike.make ?? ""} ${bike.model ?? ""}`.replace(/\s+/g, " ").trim() : ro.customer_concern || "Repair order",
        status: ro.status,
        updated: ro.updated_at,
      };
    }),
  ].sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()).slice(0, 8);

  const priorityIssues = activeIssues.filter((issue) => ["Critical", "Action Recommended"].includes(issue.severity));

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.22em] text-[#b79a62]">Today</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{greeting()}, {account.displayName.split(" ")[0]}.</h1>
        <p className="mt-2 text-sm text-[#aaa398]">What are we working on?</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between"><h2 className="text-lg font-medium">Active work</h2><span className="text-xs text-[#918b82]">{work.length} active</span></div>
        {work.length ? <div className="space-y-3">{work.map((item) => <Link key={item.key} href={item.href} className="block rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#b79a62]/40"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.18em] text-[#b79a62]">{item.module}</p><p className="mt-2 text-sm font-medium text-[#f2eee5]">{item.title}</p><p className="mt-1 text-sm text-[#918b82]">{item.detail}</p></div><span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-[#bdb7ac]">{item.status.replaceAll("_", " ")}</span></div></Link>)}</div> : <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-sm font-medium">No active work</p><p className="mt-1 text-sm text-[#918b82]">Open Property requests and Moto repair orders will appear here automatically.</p></div>}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Attention</h2>
        {priorityIssues.length ? <div className="space-y-3">{priorityIssues.slice(0, 5).map((issue) => <Link key={issue.id} href={`/admin/issues/${issue.id}`} className="block rounded-2xl border border-[#b79a62]/25 p-4"><div className="flex justify-between gap-4"><div><p className="text-sm font-medium">{issue.title}</p><p className="mt-1 text-sm text-[#918b82]">{propertyNames.get(issue.property_id) ?? "Property"}</p></div><span className="text-xs text-[#d7c08f]">{issue.severity}</span></div></Link>)}</div> : <div className="rounded-2xl border border-white/10 p-4 text-sm text-[#bdb7ac]">✓ Nothing needs attention.</div>}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link href="/hq/property" className="rounded-2xl border border-[#b79a62]/30 bg-[#b79a62]/10 p-5"><span className="text-xs uppercase tracking-[0.18em] text-[#cbb47f]">New job</span><strong className="mt-2 block text-lg">Property</strong></Link>
        <Link href="/hq/moto/ro/new" className="rounded-2xl border border-[#b79a62]/30 bg-[#b79a62]/10 p-5"><span className="text-xs uppercase tracking-[0.18em] text-[#cbb47f]">New RO</span><strong className="mt-2 block text-lg">Moto</strong></Link>
      </section>
    </div>
  );
}
