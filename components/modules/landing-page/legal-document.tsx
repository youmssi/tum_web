import type { LegalDocument } from "@/content/legal";

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <article className="max-w-6xl mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-20">
      <div className="max-w-3xl">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">{document.title}</h1>
        <p className="text-sm text-muted-foreground mb-10">
          {document.updatedLabel} {document.updated}
        </p>

        <div className="space-y-4 text-base leading-relaxed">
          {document.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {document.sections.map((section) => (
          <section key={section.heading} className="mt-12">
            <h2 className="text-xl font-semibold tracking-tight mb-4">{section.heading}</h2>
            <div className="space-y-4 text-base leading-relaxed text-foreground/85">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.items && (
                <ul className="list-disc pl-6 space-y-2">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.closing && <p>{section.closing}</p>}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
