import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const inviteType: EmailOtpType = "invite";

function inviteError(request: NextRequest, message: string) {
  const url = new URL("/auth/invite/error", request.url);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (!tokenHash || type !== inviteType) {
    return inviteError(request, "This invitation link is incomplete or invalid.");
  }

  const supabase = await createClient();
  if (!supabase) return inviteError(request, "Secure portal access is not configured.");

  const { error: verificationError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: inviteType,
  });
  if (verificationError) {
    console.error("APRISM invite token verification failed", { code: verificationError.code });
    return inviteError(request, "This invitation link has expired or has already been used.");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    await supabase.auth.signOut();
    return inviteError(request, "APRISM could not verify the invited user.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("client_account_members")
    .select("id, role, active, client_accounts!inner(id, account_type, status)")
    .eq("user_id", userData.user.id)
    .eq("active", true)
    .eq("client_accounts.status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    console.error("APRISM invite membership verification failed", { code: membershipError?.code ?? "missing_active_membership" });
    await supabase.auth.signOut();
    return inviteError(request, "This invitation is not linked to an active APRISM client account.");
  }

  return NextResponse.redirect(new URL("/portal/set-password", request.url));
}
