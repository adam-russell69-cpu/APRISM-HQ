import "server-only";

import { createClient } from "@/lib/supabase/server";

export type PortalAccount = {
  email: string | null;
  fullName: string | null;
  phone: string | null;
  preferredContactMethod: string | null;
  propertyName: string | null;
  role: string | null;
};

const emptyAccount: PortalAccount = {
  email: null,
  fullName: null,
  phone: null,
  preferredContactMethod: null,
  propertyName: null,
  role: null,
};

export async function getPortalAccount(): Promise<PortalAccount> {
  const supabase = await createClient();
  if (!supabase) return emptyAccount;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return emptyAccount;

  const [profileResult, membershipResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, preferred_contact_method")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("property_members")
      .select("role, properties(name)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle(),
  ]);

  const linkedProperty = membershipResult.data?.properties as { name?: string } | null | undefined;

  return {
    email: user.email ?? null,
    fullName: profileResult.data?.full_name?.trim() || null,
    phone: profileResult.data?.phone?.trim() || null,
    preferredContactMethod: profileResult.data?.preferred_contact_method ?? null,
    propertyName: linkedProperty?.name ?? null,
    role: membershipResult.data?.role ?? null,
  };
}
