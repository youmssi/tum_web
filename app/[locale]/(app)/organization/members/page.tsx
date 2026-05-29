import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MemberList } from "@/components/modules/organization";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("organizationPage.members");
  return { title: t("title") };
}

export default async function MembersPage() {
  const t = await getTranslations("organizationPage.members");
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <MemberList />
    </div>
  );
}
