import type { Metadata } from "next";

import { FooterSection, LandingNav, LegalDocumentView } from "@/components/modules/landing-page";
import { getLegalDocument } from "@/content/legal";
import { ROUTES } from "@/lib/constants";
import { publicPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const document = getLegalDocument("terms", locale);
  return publicPageMetadata({
    locale,
    path: ROUTES.TERMS,
    title: `${document.title} | Tûm`,
    description: document.description,
  });
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <LandingNav />
      <LegalDocumentView document={getLegalDocument("terms", locale)} />
      <FooterSection />
    </main>
  );
}
