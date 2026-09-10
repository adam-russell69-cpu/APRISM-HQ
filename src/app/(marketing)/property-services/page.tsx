import type { Metadata } from "next";
import { ServicePage } from "@/components/marketing/service-page";
import { serviceBySlug } from "@/lib/marketing";

const service = serviceBySlug["property-services"];

export const metadata: Metadata = {
  title: { absolute: service.seoTitle },
  description: service.seoDescription,
  alternates: { canonical: "/property-services" },
  openGraph: { url: "/property-services" },
};

export default function PropertyServicesPage() {
  return <ServicePage service={service} />;
}
