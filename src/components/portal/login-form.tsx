"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { signIn, type LoginState } from "@/app/portal/login/actions";

const initialState: LoginState = { status: "idle", message: "" };

export function LoginForm({ previewEnabled, nextPath = "/portal" }: { previewEnabled: boolean; nextPath?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  return <div><form action={formAction} className="grid gap-5"><input type="hidden" name="next" value={nextPath} /><label className="text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-white/48">Email<input type="email" name="email" autoComplete="email" required className="mt-2 min-h-12 w-full border border-white/15 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-[#c7a76b]" /></label><label className="text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-white/48">Password<input type="password" name="password" autoComplete="current-password" required className="mt-2 min-h-12 w-full border border-white/15 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-[#c7a76b]" /></label><button type="submit" disabled={pending} className="mt-2 inline-flex min-h-13 items-center justify-center gap-3 bg-[#c7a76b] px-6 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-black disabled:opacity-60">{pending ? "Signing in…" : nextPath.startsWith("/admin") ? "Enter admin console" : "Enter client portal"}<ArrowRight aria-hidden="true" className="size-4" /></button>{state.message ? <p role="alert" className="border border-[#a95b54]/30 bg-[#a95b54]/10 p-4 text-xs leading-5 text-[#e2a8a3]">{state.message}</p> : null}</form>{previewEnabled ? <div className="mt-6 border-t border-white/10 pt-6"><p className="text-xs leading-5 text-white/40">Supabase credentials are not connected, so authentication is in preview mode.</p><Link href="/portal" className="mt-4 inline-flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-[#d7ba82]">Open sample portal <ArrowRight aria-hidden="true" className="size-3.5" /></Link></div> : null}</div>;
}
