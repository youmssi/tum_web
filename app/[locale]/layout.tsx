import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import "../globals.css";
import { Providers } from "../providers";

const geistSans = GeistSans;
const geistMono = GeistMono;

/**
 * Per-locale layout. Validates the locale segment (404 if a visitor crafts a URL like
 * {@code /zz/...}), seeds {@link setRequestLocale} so server components and metadata pick up
 * the right strings, and wraps the tree in {@link NextIntlClientProvider} for client components.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
