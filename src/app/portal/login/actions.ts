"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { status: "idle" | "error"; message: string };

export async function signIn(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requestedPath = String(formData.get("next") ?? "");
  if (!email || !password) return { status: "error", message: "Enter your email and password." };

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "The APRISM Supabase project is not connected yet. Use the portal preview link below." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: "We could not sign you in with those credentials." };

  const nextPath = /^\/(admin|portal)(\/|$)/.test(requestedPath) ? requestedPath : "/portal";
  redirect(nextPath);
}
