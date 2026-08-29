import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StaffAccount = {
  userId: string;
  email: string;
  displayName: string;
  role: "owner" | "admin" | "steward";
};

export async function requireStaff(): Promise<{ supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>; account: StaffAccount }> {
  const supabase = await createClient();
  if (!supabase) redirect("/portal/login?next=/admin");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login?next=/admin");

  const { data: staff } = await supabase
    .from("staff_users")
    .select("role, display_name, active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!staff?.active || !["owner", "admin", "steward"].includes(staff.role)) redirect("/portal");

  return {
    supabase,
    account: {
      userId: user.id,
      email: user.email ?? "",
      displayName: staff.display_name,
      role: staff.role as StaffAccount["role"],
    },
  };
}
