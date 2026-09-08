import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireStaff } from "@/lib/admin-account";

export const metadata: Metadata = {
  title: "Operations",
  description: "Private APRISM operations console.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { account } = await requireStaff();
  return <AdminShell account={account}>{children}</AdminShell>;
}
