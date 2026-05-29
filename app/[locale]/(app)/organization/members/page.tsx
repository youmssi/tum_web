import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MemberList } from "@/components/modules/organization";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("organizationPage.members");
  return { title: t("title") };
}

// MemberList already renders its own header (including the dynamic org name in the subtitle) so
// the page is just a thin shell; adding another <h1> would duplicate the title visually.
export default function MembersPage() {
  return (
    <div className="p-6">
      <MemberList />
    </div>
  );
}
