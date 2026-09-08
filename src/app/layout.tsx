import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AprismAnalytics } from "@/components/analytics/aprism-analytics";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "APRISM | Luxury Asset Stewardship in Park City",
    template: "%s | APRISM",
  },
  description:
    "Proactive property, estate, and specialty asset stewardship for Park City and the Wasatch Back.",
  applicationName: "APRISM",
  authors: [{ name: "APRISM" }],
  creator: "APRISM",
  publisher: "APRISM",
  category: "Luxury Asset Stewardship",
  keywords: [
    "Park City estate management",
    "Park City home watch",
    "Summit County property maintenance",
    "Deer Valley property management support",
    "Promontory home maintenance",
    "luxury home stewardship Park City",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "APRISM",
    title: "APRISM | Luxury Asset Stewardship",
    description: "Managing What Matters. Proactive stewardship for Park City and the Wasatch Back.",
  },
  twitter: {
    card: "summary_large_image",
    title: "APRISM | Luxury Asset Stewardship",
    description: "Managing What Matters. Proactive stewardship for Park City and the Wasatch Back.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${cormorant.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
      <AprismAnalytics />
    </html>
  );
}
