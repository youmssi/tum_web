import type { Metadata, Viewport } from "next";

import { env } from "@/lib/env";

/**
 * Minimal root layout — the real {@code <html>} / {@code <body>} structure lives in
 * {@code app/[locale]/layout.tsx} where the locale is known. This wrapper is just here because
 * Next.js requires a layout at the {@code app/} root and we want metadata to attach to the entire
 * site (locale-prefixed or not).
 */

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Tûm",
    template: "%s · Tûm",
  },
  description:
    "Tûm brings tasks, timelines, and team visibility into one coherent workspace. No more scattered tools — just clear execution.",
  applicationName: "Tûm",
  keywords: [
    "project management",
    "task management",
    "team collaboration",
    "workflow visibility",
    "timeline",
    "kanban",
    "gantt chart",
    "open source",
  ],
  authors: [{ name: "Tûm" }],
  creator: "Tûm",
  openGraph: {
    type: "website",
    url: env.siteUrl,
    siteName: "Tûm",
    title: "Tûm — Project execution & workflow visibility",
    description:
      "Tûm brings tasks, timelines, and team visibility into one coherent workspace. No more scattered tools — just clear execution.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tûm — Project execution & workflow visibility",
    description: "Tûm brings tasks, timelines, and team visibility into one coherent workspace.",
  },
  // Icons: app/icon.svg is auto-served by Next.js as the favicon; public/favicon.svg stays as a
  // bare-URL fallback for old links. No more .ico (the previous one was the Vercel default).
  icons: {
    icon: [{ url: "/icon", type: "image/svg+xml" }],
    shortcut: "/icon",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Google Search Console — verifies the *.vercel.app subdomain without DNS TXT (which Vercel
  // doesn't expose for preview domains). Next inserts this as a <meta name="google-site-
  // verification"> tag in <head> automatically.
  verification: {
    google: "W_nff1NydesyM91YO1xnvKZDzK_b2hs-3io0n4yEj08",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
