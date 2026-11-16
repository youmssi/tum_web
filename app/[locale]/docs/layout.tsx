import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";

import { docsI18n } from "@/lib/docs/i18n";
import { docsSource } from "@/lib/docs/source";
import { ROUTES } from "@/lib/constants";

export default async function DocsRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    // The app's Providers already own next-themes; a second ThemeProvider would fight it.
    <RootProvider theme={{ enabled: false }} i18n={docsI18n.provider(locale)}>
      <DocsLayout
        tree={docsSource.getPageTree(locale)}
        nav={{ title: "Tûm Docs", url: locale === "en" ? ROUTES.DOCS : `/${locale}${ROUTES.DOCS}` }}
        links={[{ text: "Tûm", url: ROUTES.HOME }]}
        i18n
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
