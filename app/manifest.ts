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
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
