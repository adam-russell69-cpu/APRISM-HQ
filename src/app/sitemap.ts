import type { MetadataRoute } from "next";

const routes = ["", "/property-services", "/estate-management", "/home-watch", "/new-home-stewardship", "/moto", "/memberships", "/about", "/service-area", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return routes.map((route) => ({ url: `${origin}${route}`, changeFrequency: route === "" ? "weekly" : "monthly", priority: route === "" ? 1 : route === "/contact" ? 0.9 : 0.8 }));
}
