import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { Providers } from "./providers";
import { env } from "@/lib/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    locale: "en_US",
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
