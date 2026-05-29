import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { NotificationPreferences } from "@/components/modules/notifications";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notificationsPage");
  return { title: t("preferencesTitle") };
}

export default async function NotificationPreferencesPage() {
  const t = await getTranslations("notificationsPage");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t("preferencesTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("preferencesSubtitle")}</p>
      </div>
      <NotificationPreferences />
    </div>
  );
}
