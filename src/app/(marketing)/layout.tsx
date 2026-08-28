import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "APRISM",
    description: "Luxury asset stewardship for valuable homes and specialty assets.",
    areaServed: ["Park City", "Deer Valley", "Promontory", "Summit County", "Wasatch Back"],
    serviceType: ["Estate management", "Home watch", "Preventive property maintenance", "Luxury home stewardship"],
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0d0d] text-[#f0eee8]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
