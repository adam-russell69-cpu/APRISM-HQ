import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, ClipboardCheck, MessageSquareText, Plus, TriangleAlert } from "lucide-react";
import { AdminPageHeader, adminPrimaryButton, adminSecondaryButton } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge, labelStatus } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Denver" });
const shortDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/Denver" });

function getMountainGreeting(date: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "2-digit", hour12: false, timeZone: "America/Denver" }).format(date));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type IntakeData = { owner_name?: string; property_address?: string; property_name?: string; property_label?: string; client_name?: string };

export default async function AdminPage() {
  const { supabase, account } = await requireStaff();
  const [inquiryResult, propertyResult, requestResult, issueResult, assessmentResult] = await Promise.all([
    supabase.from("inquiries").select("id, name, property_location, status, created_at, updated_at").order("created_at", { ascending: false }).limit(30),
    supabase.from("properties").select("id, name, city, state, health_status, updated_at").order("updated_at", { ascending: false }).limit(30),
    supabase.from("service_requests").select("id, property_id, title, category, status, created_at, updated_at").order("updated_at", { ascending: false }).limit(30),
    supabase.from("issues").select("id, property_id, title, severity, status, created_at, updated_at").order("updated_at", { ascending: false }).limit(30),
    supabase.from("property_assessments").select("id, property_id, status, intake_data, assessment_date, created_at, updated_at").order("updated_at", { ascending: false }).limit(30),
  ]);

  const inquiries = inquiryResult.data ?? [];
  const properties = propertyResult.data ?? [];
  const requests = requestResult.data ?? [];
  const issues = issueResult.data ?? [];
  const assessments = assessmentResult.data ?? [];
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const activeRequests = requests.filter((request) => !["completed", "cancelled"].includes(request.status));
  const activeIssues = issues.filter((issue) => !["resolved", "closed"].includes(issue.status));
  const priorityIssues = activeIssues.filter((issue) => ["Critical", "Action Recommended"].includes(issue.severity));
  const inProgressAssessments = assessments.filter((assessment) => ["field_draft", "report_draft", "scheduled"].includes(assessment.status));
  const newIntakes = assessments.filter((assessment) => assessment.status === "intake_received");
  const now = new Date();

  const attention = [
    ...newIntakes.map((assessment) => { const intake = assessment.intake_data as IntakeData; return { key: `assessment-${assessment.id}`, href: `/admin/assessments/${assessment.id}`, type: "New intake", title: intake.property_address || intake.property_name || "Property intake", detail: intake.owner_name || intake.client_name || "Client intake", status: "intake_received", date: assessment.created_at }; }),
    ...priorityIssues.map((issue) => ({ key: `issue-${issue.id}`, href: `/admin/issues/${issue.id}`, type: "Property issue", title: issue.title, detail: propertyNames.get(issue.property_id) ?? "Property", status: issue.severity, date: issue.updated_at })),
    ...activeRequests.filter((request) => ["submitted", "reviewing"].includes(request.status)).map((request) => ({ key: `request-${request.id}`, href: `/admin/requests/${request.id}`, type: "Service request", title: request.title, detail: propertyNames.get(request.property_id) ?? "Property", status: request.status, date: request.created_at })),
    ...inProgressAssessments.map((assessment) => { const intake = assessment.intake_data as IntakeData; return { key: `assessment-work-${assessment.id}`, href: `/admin/assessments/${assessment.id}`, type: assessment.status === "report_draft" ? "Report awaiting completion" : "Field work", title: intake.property_label || intake.property_address || intake.property_name || propertyNames.get(assessment.property_id ?? "") || "Assessment", detail: assessment.status === "report_draft" ? "Continue client report" : "Continue field assessment", status: assessment.status, date: assessment.updated_at }; }),
  ].toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  const activity = [
    ...assessments.map((item) => ({ key: `a-${item.id}`, href: `/admin/assessments/${item.id}`, title: item.status === "intake_received" ? "Intake received" : `Assessment moved to ${labelStatus(item.status)}`, date: item.updated_at })),
    ...issues.map((item) => ({ key: `i-${item.id}`, href: `/admin/issues/${item.id}`, title: `Issue updated · ${item.title}`, date: item.updated_at })),
    ...requests.map((item) => ({ key: `r-${item.id}`, href: `/admin/requests/${item.id}`, title: `Request ${labelStatus(item.status)} · ${item.title}`, date: item.updated_at })),
    ...properties.map((item) => ({ key: `p-${item.id}`, href: `/admin/properties/${item.id}`, title: `Property updated · ${item.name}`, date: item.updated_at })),
    ...inquiries.map((item) => ({ key: `l-${item.id}`, href: "/admin/clients?view=leads", title: `Lead ${labelStatus(item.status)} · ${item.name}`, date: item.updated_at })),
  ].toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <AdminPageHeader eyebrow="Private operations" title={`${getMountainGreeting(now)}, ${account.displayName.split(" ")[0]}`} description={`APRISM Operations · ${dateFormatter.format(now)}`} actions={<><Link href="/admin/assessments/new" className={adminPrimaryButton}><ClipboardCheck aria-hidden="true" className="size-4" />New Assessment</Link><Link href="/admin/properties/new" className={adminSecondaryButton}><Plus aria-hidden="true" className="size-4" />Add Property</Link></>} />

    <section className="mt-7 overflow-hidden border border-black/10 bg-[#171b19] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6"><div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#d0b274]">Needs attention</p><h2 className="mt-2 font-serif text-3xl">Operational queue</h2></div><span className="text-sm text-white/35">{attention.length} active</span></div>
      {attention.length ? <div className="divide-y divide-white/10">{attention.map((item) => <Link key={item.key} href={item.href} className="grid gap-3 px-5 py-4 transition hover:bg-white/[0.045] sm:grid-cols-[0.75fr_1.5fr_0.8fr_auto] sm:items-center sm:px-6"><p className="text-xs font-semibold text-[#d0b274]">{item.type}</p><div><p className="text-sm font-medium text-white/88">{item.title}</p><p className="mt-1 text-xs text-white/38">{item.detail}</p></div><StatusBadge value={item.status} className="border-white/15 bg-white/[0.04] text-white/65" /><div className="flex items-center gap-3 text-xs text-white/35"><span>{shortDateFormatter.format(new Date(item.date))}</span><ArrowRight aria-hidden="true" className="size-4" /></div></Link>)}</div> : <div className="flex min-h-36 items-center gap-4 px-6"><CheckCircle2 aria-hidden="true" className="size-8 text-[#c7a76b]" /><div><p className="font-serif text-2xl">Everything current.</p><p className="mt-1 text-sm text-white/42">No new intakes, priority issues, or unfinished assessment steps.</p></div></div>}
    </section>

    <section aria-label="Operating metrics" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { href: "/admin/properties", label: "Properties under stewardship", value: properties.length, icon: Building2 },
        { href: "/admin/assessments?view=field", label: "Assessments in progress", value: inProgressAssessments.length, icon: ClipboardCheck },
        { href: "/admin/requests?view=open", label: "Open service requests", value: activeRequests.length, icon: MessageSquareText },
        { href: "/admin/issues?view=priority", label: "Priority issues", value: priorityIssues.length, icon: TriangleAlert },
      ].map(({ href, label, value, icon: Icon }) => <Link key={label} href={href} className="group border border-black/10 bg-white p-5 transition hover:border-[#a8864e]/55"><div className="flex items-start justify-between"><Icon aria-hidden="true" className="size-5 text-[#8c6d36]" /><ArrowRight aria-hidden="true" className="size-4 text-black/20 transition group-hover:translate-x-0.5 group-hover:text-black/50" /></div><p className="mt-6 font-serif text-4xl">{value}</p><p className="mt-2 text-sm text-black/48">{label}</p></Link>)}
    </section>

    <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="border border-black/10 bg-white"><div className="border-b border-black/10 px-5 py-4"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Today & recent</p><h2 className="mt-2 font-serif text-2xl">Activity</h2></div>{activity.length ? <div className="divide-y divide-black/10">{activity.map((item) => <Link key={item.key} href={item.href} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#faf8f3]"><p className="text-sm text-black/66">{item.title}</p><time className="shrink-0 text-xs text-black/35">{shortDateFormatter.format(new Date(item.date))}</time></Link>)}</div> : <EmptyState icon={CheckCircle2} title="No recent activity" description="Operational updates will appear here as records change." />}</section>

      <section className="border border-black/10 bg-white"><div className="flex items-end justify-between border-b border-black/10 px-5 py-4"><div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Portfolio</p><h2 className="mt-2 font-serif text-2xl">Recent properties</h2></div><Link href="/admin/properties" className="text-xs font-semibold text-black/45 hover:text-black">View all</Link></div>{properties.length ? <div className="divide-y divide-black/10">{properties.slice(0, 6).map((property) => { const issueCount = activeIssues.filter((issue) => issue.property_id === property.id).length; const requestCount = activeRequests.filter((request) => request.property_id === property.id).length; return <Link key={property.id} href={`/admin/properties/${property.id}`} className="grid gap-3 px-5 py-4 transition hover:bg-[#faf8f3] sm:grid-cols-[1.4fr_0.8fr_0.7fr] sm:items-center"><div><p className="font-serif text-xl">{property.name}</p><p className="mt-1 text-xs text-black/40">{property.city}, {property.state}</p></div><StatusBadge value={property.health_status} /><div className="text-xs text-black/42"><p>{issueCount} open issue{issueCount === 1 ? "" : "s"}</p><p className="mt-1">{requestCount} open request{requestCount === 1 ? "" : "s"}</p></div></Link>; })}</div> : <EmptyState icon={Building2} title="No properties yet" description="Properties under active stewardship will appear here." />}</section>
    </div>
  </main>;
}
