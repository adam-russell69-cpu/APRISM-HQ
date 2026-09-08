import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const inviteType: EmailOtpType = "invite";

function inviteError(request: NextRequest, message: string) {
  const url = new URL("/auth/invite/error", request.url);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

async function hasActiveMembership(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, userId: string) {
  const { data, error } = await supabase
    .from("client_account_members")
    .select("id, role, active, client_accounts!inner(id, account_type, status)")
    .eq("user_id", userId)
    .eq("active", true)
    .eq("client_accounts.status", "active")
    .limit(1)
    .maybeSingle();
  return { membership: data, error };
}

function fragmentBridge() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Verifying Invitation | APRISM</title></head><body style="margin:0;background:#0b0d0d;color:white;font-family:Arial,sans-serif;display:grid;min-height:100vh;place-items:center"><main style="max-width:440px;padding:32px;text-align:center"><p style="letter-spacing:.28em;font-size:12px">APRISM</p><h1 style="font-family:Georgia,serif;font-size:42px;font-weight:400;margin:36px 0 16px">Verifying your invitation.</h1><p style="color:rgba(255,255,255,.5);line-height:1.7">Securing your client portal access…</p></main><script>(async()=>{const p=new URLSearchParams(location.hash.slice(1));const access_token=p.get('access_token');const refresh_token=p.get('refresh_token');history.replaceState(null,'',location.pathname);if(!access_token||!refresh_token){location.replace('/auth/invite/error?message='+encodeURIComponent('This invitation link is incomplete or invalid.'));return;}try{const r=await fetch('/auth/invite',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({access_token,refresh_token})});const j=await r.json();location.replace(r.ok&&j.redirect?j.redirect:'/auth/invite/error?message='+encodeURIComponent(j.error||'APRISM could not verify this invitation.'));}catch{location.replace('/auth/invite/error?message='+encodeURIComponent('APRISM could not verify this invitation.'));}})();</script></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store, max-age=0" },
  });
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  // Custom token-hash templates use direct server-side OTP verification.
  // Default Supabase invite templates redirect back with an authenticated
  // session in the URL fragment, which is bridged to POST below and then
  // verified again against Supabase Auth on the server.
  if (!tokenHash && !type) return fragmentBridge();
  if (!tokenHash || type !== inviteType) return inviteError(request, "This invitation link is incomplete or invalid.");

  const supabase = await createClient();
  if (!supabase) return inviteError(request, "Secure portal access is not configured.");

  const { error: verificationError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: inviteType });
  if (verificationError) {
    console.error("APRISM invite token verification failed", { code: verificationError.code });
    return inviteError(request, "This invitation link has expired or has already been used.");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    await supabase.auth.signOut();
    return inviteError(request, "APRISM could not verify the invited user.");
  }

  const { membership, error: membershipError } = await hasActiveMembership(supabase, userData.user.id);
  if (membershipError || !membership) {
    console.error("APRISM invite membership verification failed", { code: membershipError?.code ?? "missing_active_membership" });
    await supabase.auth.signOut();
    return inviteError(request, "This invitation is not linked to an active APRISM client account.");
  }

  return NextResponse.redirect(new URL("/portal/set-password", request.url));
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid invitation request." }, { status: 403 });

  let body: { access_token?: unknown; refresh_token?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid invitation request." }, { status: 400 });
  }

  const accessToken = typeof body.access_token === "string" ? body.access_token : "";
  const refreshToken = typeof body.refresh_token === "string" ? body.refresh_token : "";
  if (!accessToken || !refreshToken || accessToken.length > 10000 || refreshToken.length > 10000) {
    return NextResponse.json({ error: "This invitation link is incomplete or invalid." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Secure portal access is not configured." }, { status: 503 });

  const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (sessionError) return NextResponse.json({ error: "This invitation link has expired or has already been used." }, { status: 401 });

  // getUser makes a server-to-server Auth request and does not trust the
  // browser-supplied session object for authorization.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "APRISM could not verify the invited user." }, { status: 401 });
  }

  const { membership, error: membershipError } = await hasActiveMembership(supabase, userData.user.id);
  if (membershipError || !membership) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "This invitation is not linked to an active APRISM client account." }, { status: 403 });
  }

  return NextResponse.json({ redirect: "/portal/set-password" }, { headers: { "cache-control": "no-store, max-age=0" } });
}
