import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { ApiReference } from "@/components/modules/docs";
import { ROUTES } from "@/lib/constants";
import { publicPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return publicPageMetadata({
    locale,
    path: ROUTES.API_REFERENCE,
    title: "API reference",
    description:
      "Endpoints of the Tûm REST API: projects, tasks, dependencies, comments and more, with request and response schemas.",
  });
}

export default async function ApiReferencePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ApiReference />;
}
