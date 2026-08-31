import "server-only";

import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./config";

const receiptHeader = "x-aprism-receipt-token";

export function createAssessmentIntakeClient(receiptToken: string) {
  if (!supabaseUrl || !supabasePublishableKey) return null;

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: {
        [receiptHeader]: receiptToken,
      },
    },
  });
}
