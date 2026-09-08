import { LockKeyhole, UserRound } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireStaff } from "@/lib/admin-account";

export default async function SettingsPage() {
  const { account } = await requireStaff();
  return <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><AdminPageHeader eyebrow="Operations access" title="Settings" description="Review the signed-in staff account and the protections applied to the APRISM operations console." />
    <div className="mt-6 grid gap-5 md:grid-cols-2"><section className="border border-black/10 bg-white p-5 sm:p-6"><UserRound aria-hidden="true" className="size-6 text-[#8f713d]" /><p className="mt-5 text-xs font-semibold text-black/35">Signed-in account</p><p className="mt-2 break-all font-serif text-2xl">{account.email}</p><div className="mt-5"><StatusBadge value={account.role} /></div></section><section className="border border-black/10 bg-[#171a19] p-5 text-white sm:p-6"><LockKeyhole aria-hidden="true" className="size-6 text-[#c7a76b]" /><h2 className="mt-5 font-serif text-2xl">Staff-only workspace</h2><p className="mt-3 text-sm leading-6 text-white/52">Every admin route verifies staff access on the server. Database reads and updates continue through Supabase row-level security.</p></section></div>
  </main>;
}
