import type { Metadata } from "next";
import { ServicePage } from "@/components/marketing/service-page";
import { serviceBySlug } from "@/lib/marketing";

const service = serviceBySlug.moto;

export const metadata: Metadata = { title: service.seoTitle, description: service.seoDescription };

export default function MotoPage() {
  return (
    <ServicePage
      service={service}
      editorialMedia={{
        src: "/images/aprism-moto-hero.png",
        alt: "Black classic motorcycle in a private collection setting",
        eyebrow: "Specialty asset stewardship",
        caption: "Motorcycles, collections and machines cared for with the same discipline as the property that houses them.",
      }}
    />
  );
}
