export type LegalSection = {
  heading: string;
  paragraphs: string[];
  items?: string[];
  closing?: string;
};

export type LegalDocument = {
  title: string;
  description: string;
  updatedLabel: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
};

export type LegalDocumentKind = "terms" | "privacy";
