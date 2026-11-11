import type { LegalDocument, LegalDocumentKind } from "./types";
import { privacyEn } from "./privacy.en";
import { privacyFr } from "./privacy.fr";
import { termsEn } from "./terms.en";
import { termsFr } from "./terms.fr";

const DOCUMENTS: Record<LegalDocumentKind, Record<string, LegalDocument>> = {
  terms: { en: termsEn, fr: termsFr },
  privacy: { en: privacyEn, fr: privacyFr },
};

export function getLegalDocument(kind: LegalDocumentKind, locale: string): LegalDocument {
  return DOCUMENTS[kind][locale] ?? DOCUMENTS[kind].en;
}

export type { LegalDocument, LegalDocumentKind };
