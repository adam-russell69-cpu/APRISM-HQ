import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Client Portal", description: "APRISM private client property stewardship portal.", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell signOutAction={signOut}>{children}</PortalShell>;
}
