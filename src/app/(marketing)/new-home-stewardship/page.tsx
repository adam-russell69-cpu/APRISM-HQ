import type { Metadata } from "next";
import { ServicePage } from "@/components/marketing/service-page";
import { serviceBySlug } from "@/lib/marketing";

const service = serviceBySlug["new-home-stewardship"];

export const metadata: Metadata = { title: service.seoTitle, description: service.seoDescription };

export default function NewHomeStewardshipPage() {
  return <ServicePage service={service} />;
}
