import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.title,
    short_name: "Schmeckle Wars",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#06080B",
    theme_color: "#06080B",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
