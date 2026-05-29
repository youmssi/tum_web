import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ProfileForm } from "@/components/modules/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("profile") };
}

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ProfileForm />
    </div>
  );
}
