import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MyWorkDashboard } from "@/components/modules/analytics";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("dashboard") };
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <MyWorkDashboard />
    </div>
  );
}
