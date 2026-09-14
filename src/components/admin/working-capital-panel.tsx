import { DollarSign, Fuel, Landmark, ReceiptText, WalletCards } from "lucide-react";
import { updateWorkingCapital } from "@/app/admin/actions";

type WorkingCapitalPanelProps = {
  operatingCash: number;
  ownerPaidUnreimbursed: number;
  clientAdvances: number;
  upcomingCommitments: number;
  receivables: number;
  minimumReserveTarget: number;
  stabilityReserveTarget: number;
  notes?: string | null;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function pct(value: number, target: number) {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}

export function WorkingCapitalPanel({
  operatingCash,
  ownerPaidUnreimbursed,
  clientAdvances,
  upcomingCommitments,
  receivables,
  minimumReserveTarget,
  stabilityReserveTarget,
  notes,
}: WorkingCapitalPanelProps) {
  const minimumProgress = pct(operatingCash, minimumReserveTarget);
  const stabilityProgress = pct(operatingCash, stabilityReserveTarget);
  const freeCashAfterCommitments = Math.max(0, operatingCash - upcomingCommitments - clientAdvances);

  return (
    <section className="mt-6 border border-black/10 bg-white">
      <div className="grid gap-6 border-b border-black/10 px-5 py-5 lg:grid-cols-[1fr_auto] lg:items-end lg:px-6">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#87682f]">Proof Mode · Cash control</p>
          <h2 className="mt-2 font-serif text-3xl">Working capital reserve</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-black/48">Protect operating cash, reimburse owner-paid business costs, and stop client work from quietly consuming household money.</p>
        </div>
        <div className="text-left lg:text-right">
          <p className="text-xs uppercase tracking-[0.12em] text-black/35">Operating cash</p>
          <p className="mt-1 font-serif text-4xl">{money.format(operatingCash)}</p>
        </div>
      </div>

      <div className="grid gap-px bg-black/10 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Operating cash", value: operatingCash, icon: WalletCards },
          { label: "A/R outstanding", value: receivables, icon: ReceiptText },
          { label: "Owner-paid unreimbursed", value: ownerPaidUnreimbursed, icon: DollarSign },
          { label: "Client advances held", value: clientAdvances, icon: Landmark },
          { label: "Upcoming commitments", value: upcomingCommitments, icon: Fuel },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white p-5">
            <Icon aria-hidden="true" className="size-4 text-[#8c6d36]" />
            <p className="mt-5 font-serif text-2xl">{money.format(value)}</p>
            <p className="mt-1 text-xs text-black/45">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-sm font-semibold">Minimum reserve</p><p className="mt-1 text-xs text-black/40">First operating floor</p></div>
              <p className="text-sm font-semibold">{minimumProgress}% · {money.format(minimumReserveTarget)}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden bg-black/[0.07]"><div className="h-full bg-[#9b7b42]" style={{ width: `${minimumProgress}%` }} /></div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-sm font-semibold">Stability reserve</p><p className="mt-1 text-xs text-black/40">Next-stage cash cushion</p></div>
              <p className="text-sm font-semibold">{stabilityProgress}% · {money.format(stabilityReserveTarget)}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden bg-black/[0.07]"><div className="h-full bg-[#171b19]" style={{ width: `${stabilityProgress}%` }} /></div>
          </div>

          <div className="border border-black/10 bg-[#faf8f3] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-black/40">Free cash after commitments & client funds</p>
            <p className="mt-2 font-serif text-3xl">{money.format(freeCashAfterCommitments)}</p>
            <p className="mt-2 text-xs leading-5 text-black/45">Client advances are shown separately so they are not mistaken for APRISM's own reserve.</p>
          </div>
        </div>

        <form action={updateWorkingCapital} className="border border-black/10 p-4 sm:p-5">
          <p className="text-sm font-semibold">Update cash position</p>
          <p className="mt-1 text-xs leading-5 text-black/42">Enter actual figures only. Invoices do not count as cash until collected.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["operating_cash", "Operating cash", operatingCash],
              ["owner_paid_unreimbursed", "Owner-paid unreimbursed", ownerPaidUnreimbursed],
              ["client_advances", "Client advances", clientAdvances],
              ["upcoming_commitments", "Upcoming commitments", upcomingCommitments],
            ].map(([name, label, value]) => (
              <label key={String(name)} className="text-xs font-medium text-black/60">{label}
                <div className="mt-2 flex border border-black/15 bg-white focus-within:border-[#92713a]"><span className="px-3 py-2.5 text-black/35">$</span><input name={String(name)} type="number" min="0" step="0.01" defaultValue={Number(value).toFixed(2)} className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm outline-none" /></div>
              </label>
            ))}
          </div>
          <label className="mt-4 block text-xs font-medium text-black/60">Notes
            <textarea name="notes" defaultValue={notes ?? ""} rows={3} placeholder="Owner loan, reimbursement due, large upcoming material purchase…" className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#92713a]" />
          </label>
          <button type="submit" className="mt-4 inline-flex items-center justify-center bg-[#171b19] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black">Save cash position</button>
        </form>
      </div>
    </section>
  );
}
