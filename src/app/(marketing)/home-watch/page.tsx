import type { Metadata } from "next";
import { ServicePage } from "@/components/marketing/service-page";
import { serviceBySlug } from "@/lib/marketing";

const service = serviceBySlug["home-watch"];

export const metadata: Metadata = {
  title: { absolute: service.seoTitle },
  description: service.seoDescription,
  alternates: { canonical: "/home-watch" },
  openGraph: { url: "/home-watch" },
};

export default function HomeWatchPage() {
  return <ServicePage service={service} />;
}
