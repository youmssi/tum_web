import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/projects",
          "/profile",
          "/organization/",
          "/notifications/",
          "/onboarding",
          "/workspaces",
          "/invitations/",
          "/login",
          "/signup",
        ],
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
