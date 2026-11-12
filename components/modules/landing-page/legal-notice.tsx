import { getTranslations } from "next-intl/server";

import { COMPANY, CONTACT } from "@/lib/constants";
import { productMailto } from "@/lib/contact";

const LINK_CLASS = "underline underline-offset-4 hover:text-muted-foreground";

export async function LegalNotice() {
  const t = await getTranslations("landing.pages.legal");
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t("labels.company"), value: COMPANY.NAME },
    { label: t("labels.tradeName"), value: COMPANY.TRADE_NAME },
    { label: t("labels.address"), value: `${COMPANY.ADDRESS}, ${t("country")}` },
    { label: t("labels.rccm"), value: COMPANY.RCCM },
    { label: t("labels.taxId"), value: COMPANY.TAX_ID },
    {
      label: t("labels.contact"),
      value: (
        <a className={LINK_CLASS} href={productMailto(CONTACT.EMAIL, "Enquiry")}>
          {CONTACT.EMAIL}
        </a>
      ),
    },
    {
      label: t("labels.support"),
      value: (
        <a className={LINK_CLASS} href={productMailto(CONTACT.SUPPORT_EMAIL, "Support request")}>
          {CONTACT.SUPPORT_EMAIL}
        </a>
      ),
    },
    {
      label: t("labels.website"),
      value: (
        <a className={LINK_CLASS} href={COMPANY.URL}>
          {COMPANY.URL.replace("https://", "")}
        </a>
      ),
    },
    { label: t("labels.license"), value: t("licenseValue") },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
      <dl className="max-w-2xl divide-y divide-foreground/8 border-y border-foreground/8">
        {rows.map((row) => (
          <div key={row.label} className="grid sm:grid-cols-3 gap-1 sm:gap-6 py-4 text-sm">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="sm:col-span-2 font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
