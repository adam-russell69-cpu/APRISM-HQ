import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { setInvitedUserPassword } from "./actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set Your Password",
  description: "Finish secure APRISM portal setup.",
  robots: { index: false, follow: false },
};

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  if (!supabase) redirect("/portal/login");

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/portal/login?next=/portal/set-password");

  const { data: membership, error: membershipError } = await supabase
    .from("client_account_members")
    .select("id, role, active, client_accounts!inner(display_name, account_type, status)")
    .eq("user_id", userData.user.id)
    .eq("active", true)
    .eq("client_accounts.status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) redirect("/auth/invite/error?message=Your%20APRISM%20client%20access%20is%20not%20active.");
  const linkedAccount = Array.isArray(membership.client_accounts) ? membership.client_accounts[0] : membership.client_accounts;
  const accountName = linkedAccount?.display_name ?? "your APRISM account";

  return <main className="min-h-screen bg-[#0b0d0d] px-5 py-16 text-white sm:px-8">
    <div className="mx-auto w-full max-w-lg">
      <Link href="/" className="text-base font-semibold tracking-[0.3em]">APRISM</Link>
      <section className="mt-14 border border-white/10 bg-[#111514] p-6 sm:p-8">
        <div className="flex size-11 items-center justify-center border border-[#c7a76b]/30 bg-[#c7a76b]/10"><ShieldCheck aria-hidden="true" className="size-5 text-[#d1b477]" /></div>
        <p className="mt-7 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#c7a76b]">Invitation verified</p>
        <h1 className="mt-4 font-serif text-5xl leading-none">Set your password.</h1>
        <p className="mt-5 text-sm leading-7 text-white/48">Your secure access to <span className="text-white/75">{accountName}</span> is verified. Choose a password to finish your APRISM portal setup.</p>
        {error ? <p role="alert" className="mt-6 border border-[#b7736b]/30 bg-[#b7736b]/10 px-4 py-3 text-sm text-[#e4aaa2]">{error}</p> : null}
        <form action={setInvitedUserPassword} className="mt-7 space-y-5">
          <label className="block text-xs font-semibold text-white/55">New password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required className="mt-2 min-h-12 w-full border border-white/15 bg-black/25 px-4 text-sm text-white outline-none focus:border-[#c7a76b]" /></label>
          <label className="block text-xs font-semibold text-white/55">Confirm password<input name="password_confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required className="mt-2 min-h-12 w-full border border-white/15 bg-black/25 px-4 text-sm text-white outline-none focus:border-[#c7a76b]" /></label>
          <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 bg-[#c7a76b] px-5 text-xs font-semibold text-[#111311]"><KeyRound aria-hidden="true" className="size-4" />Set Password & Open Portal</button>
        </form>
        <p className="mt-6 text-xs leading-5 text-white/30">For security, invitation links are one-time use. If this link has expired, contact APRISM for a new invitation.</p>
      </section>
    </div>
  </main>;
}
