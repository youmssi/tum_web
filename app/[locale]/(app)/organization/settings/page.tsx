import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { DeleteOrgCard, OrgSettingsForm } from "@/components/modules/organization";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("organizationPage.settings");
  return { title: t("title") };
}

export default async function OrgSettingsPage() {
  const t = await getTranslations("organizationPage.settings");
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <OrgSettingsForm />
      <DeleteOrgCard />
    </div>
  );
}
