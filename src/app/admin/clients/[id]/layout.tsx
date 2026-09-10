import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin-account";
import { updateRecurringRelationship } from "./recurring-actions";

const inputClass = "mt-2 min-h-11 w-full border border-black/15 bg-white px-3.5 text-sm outline-none focus:border-[#8f713d]";

export default async function ClientAccountLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireStaff();
  const { data: account } = await supabase
    .from("client_accounts")
    .select("id, display_name, status, recurring_active, expected_monthly_value")
    .eq("id", id)
    .maybeSingle();

  if (!account) notFound();

  return (
    <>
      <div className="mx-auto max-w-[1500px] px-4 pt-7 sm:px-6 lg:px-8 lg:pt-9">
        <section className="border border-black/10 bg-[#171b19] p-5 text-white sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#d0b274]">Proof Mode relationship</p>
              <h2 className="mt-2 font-serif text-3xl">Recurring client status</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                Mark this only when APRISM has a genuine ongoing service relationship. The expected monthly value feeds the Proof Mode recurring-revenue target.
              </p>
            </div>
            <form action={updateRecurringRelationship} className="grid gap-4 sm:grid-cols-[0.8fr_1fr_auto] sm:items-end">
              <input type="hidden" name="account_id" value={account.id} />
              <label className="text-xs font-semibold text-white/55">
                Recurring relationship
                <select name="recurring_active" defaultValue={String(Boolean(account.recurring_active))} className={`${inputClass} text-black`}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-white/55">
                Expected monthly revenue
                <input
                  name="expected_monthly_value"
                  type="number"
                  min={0}
                  max={1000000}
                  step="0.01"
                  defaultValue={Number(account.expected_monthly_value ?? 0)}
                  className={`${inputClass} text-black`}
                />
              </label>
              <button type="submit" className="min-h-11 bg-[#c7a76b] px-5 text-xs font-semibold text-black">
                Save relationship
              </button>
            </form>
          </div>
          <p className="mt-4 text-[0.7rem] text-white/35">
            Current state: {account.recurring_active ? "Recurring" : "Not recurring"} · Expected MRR ${Number(account.expected_monthly_value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </p>
        </section>
      </div>
      {children}
    </>
  );
}
