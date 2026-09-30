import "server-only";

import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

export type PortalScope = {
  propertyIds: string[];
  accountIds: string[];
};

export async function getPortalScope(supabase: SupabaseServerClient, userId: string): Promise<PortalScope> {
  const [propertyMemberships, accountMemberships] = await Promise.all([
    supabase.from("property_members").select("property_id").eq("user_id", userId),
    supabase.from("client_account_members").select("client_account_id").eq("user_id", userId).eq("active", true),
  ]);

  if (propertyMemberships.error || accountMemberships.error) {
    throw propertyMemberships.error ?? accountMemberships.error;
  }

  const directPropertyIds = (propertyMemberships.data ?? []).map((row) => row.property_id);
  const accountIds = (accountMemberships.data ?? []).map((row) => row.client_account_id);

  let accountPropertyIds: string[] = [];
  if (accountIds.length) {
    const accountProperties = await supabase
      .from("properties")
      .select("id")
      .in("client_account_id", accountIds)
      .is("archived_at", null);
    if (accountProperties.error) throw accountProperties.error;
    accountPropertyIds = (accountProperties.data ?? []).map((row) => row.id);
  }

  return {
    propertyIds: [...new Set([...directPropertyIds, ...accountPropertyIds])],
    accountIds,
  };
}
