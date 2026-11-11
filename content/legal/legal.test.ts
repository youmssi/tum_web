import { describe, expect, it } from "vitest";

import { routing } from "@/i18n/routing";
import { getLegalDocument, type LegalDocumentKind } from "./index";

const KINDS: LegalDocumentKind[] = ["terms", "privacy"];

describe("legal documents", () => {
  it.each(KINDS)("%s has the same section structure in every locale", (kind) => {
    const shape = (locale: string) =>
      getLegalDocument(kind, locale).sections.map((s) => ({
        paragraphs: s.paragraphs.length,
        items: s.items?.length ?? 0,
        closing: Boolean(s.closing),
      }));

    for (const locale of routing.locales) {
      expect(shape(locale), `${kind} (${locale})`).toEqual(shape(routing.defaultLocale));
    }
  });

  it("falls back to English for an unknown locale", () => {
    expect(getLegalDocument("terms", "zz").title).toBe("Terms of Service");
  });
});
