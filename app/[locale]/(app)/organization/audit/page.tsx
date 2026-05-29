import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuditLog } from "@/components/modules/audit";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("organizationPage.audit");
  return { title: t("title") };
}

export default async function AuditPage() {
  const t = await getTranslations("organizationPage.audit");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <AuditLog />
    </div>
  );
}
