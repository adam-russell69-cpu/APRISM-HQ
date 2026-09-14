import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { WorkingCapitalPanel } from "@/components/admin/working-capital-panel";
import { requireStaff } from "@/lib/admin-account";

export default async function WorkingCapitalPage() {
  const { supabase } = await requireStaff();

  const [capitalResult, invoiceResult] = await Promise.all([
    supabase.from("working_capital").select("operating_cash, owner_paid_unreimbursed, client_advances, upcoming_commitments, minimum_reserve_target, stability_reserve_target, notes").eq("singleton_id", 1).maybeSingle(),
    supabase.from("invoices").select("amount_due, status").in("status", ["sent", "partially_paid", "overdue"]),
  ]);

  const capital = capitalResult.data;
  const receivables = (invoiceResult.data ?? []).reduce((sum, invoice) => sum + Number(invoice.amount_due ?? 0), 0);

  return <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <AdminPageHeader eyebrow="Proof Mode" title="Working Capital" description="APRISM operating cash, reserve targets, client advances, commitments, and unreimbursed owner expenses." />
    <div className="mt-7">
      <WorkingCapitalPanel
        operatingCash={Number(capital?.operating_cash ?? 0)}
        ownerPaidUnreimbursed={Number(capital?.owner_paid_unreimbursed ?? 0)}
        clientAdvances={Number(capital?.client_advances ?? 0)}
        upcomingCommitments={Number(capital?.upcoming_commitments ?? 0)}
        receivables={receivables}
        minimumReserveTarget={Number(capital?.minimum_reserve_target ?? 2500)}
        stabilityReserveTarget={Number(capital?.stability_reserve_target ?? 5000)}
        notes={capital?.notes ?? null}
      />
    </div>
  </main>;
}
