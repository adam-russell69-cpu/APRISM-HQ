import type { Metadata } from "next";
import { ServicePage } from "@/components/marketing/service-page";
import { serviceBySlug } from "@/lib/marketing";

const service = serviceBySlug["estate-management"];

export const metadata: Metadata = {
  title: service.seoTitle,
  description: service.seoDescription,
  alternates: { canonical: "/estate-management" },
  openGraph: { url: "/estate-management" },
};

export default function EstateManagementPage() {
  return <ServicePage service={service} />;
}
