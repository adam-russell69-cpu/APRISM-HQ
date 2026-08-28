"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./config";

export function createClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("APRISM Supabase browser credentials are not configured.");
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
