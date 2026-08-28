import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "APRISM Luxury Asset Stewardship", short_name: "APRISM", description: "Private property and specialty asset stewardship for Park City and the Wasatch Back.", start_url: "/", display: "standalone", background_color: "#0b0d0d", theme_color: "#0b0d0d" };
}
