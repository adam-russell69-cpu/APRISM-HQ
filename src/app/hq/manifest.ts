import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "APRISM HQ",
    short_name: "APRISM HQ",
    description: "APRISM operational headquarters for Property, Moto and R&D.",
    start_url: "/hq",
    scope: "/hq",
    display: "standalone",
    background_color: "#10100f",
    theme_color: "#10100f",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/hq/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/hq/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
