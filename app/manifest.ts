import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tûm",
    short_name: "Tûm",
    description: "Tûm brings tasks, timelines, and team visibility into one coherent workspace.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f0f0f",
    icons: [
      {
        src: "/favicon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
