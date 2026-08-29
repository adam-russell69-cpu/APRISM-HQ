import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "./config";

function copyAuthState(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }
  return target;
}

export async function updateSession(request: NextRequest) {
  if (!supabaseUrl || !supabasePublishableKey) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);
  const isLoginRoute = request.nextUrl.pathname === "/portal/login";

  if (!isSignedIn && !isLoginRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/portal/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return copyAuthState(response, NextResponse.redirect(loginUrl));
  }

  if (isSignedIn && isLoginRoute) {
    const portalUrl = request.nextUrl.clone();
    const nextPath = request.nextUrl.searchParams.get("next");
    portalUrl.pathname = nextPath && /^\/(admin|portal)(\/|$)/.test(nextPath) ? nextPath : "/portal";
    portalUrl.search = "";
    return copyAuthState(response, NextResponse.redirect(portalUrl));
  }

  return response;
}
