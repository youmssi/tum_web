import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Step, Steps } from "fumadocs-ui/components/steps";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";

import { docsSource } from "@/lib/docs/source";

type Params = Promise<{ locale: string; slug?: string[] }>;

export function generateStaticParams() {
  return docsSource.generateParams("slug", "locale");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = docsSource.getPage(slug, locale);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
  };
}

export default async function DocsRoutePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const page = docsSource.getPage(slug, locale);
  if (!page) notFound();
  const Body = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <Body components={{ ...defaultMdxComponents, Step, Steps }} />
      </DocsBody>
    </DocsPage>
  );
}
