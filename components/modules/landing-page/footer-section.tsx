import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/lib/constants";
import { TumLogo } from "./tum-logo";

type LinkKey =
  | "features"
  | "howItWorks"
  | "pricing"
  | "dashboard"
  | "timeline"
  | "board"
  | "signIn"
  | "signUp"
  | "acceptInvitation";

export async function FooterSection() {
  const t = await getTranslations("landing.footer");
  const sections: {
    section: "product" | "platform" | "account";
    items: { key: LinkKey; href: string }[];
  }[] = [
    {
      section: "product",
      items: [
        { key: "features", href: "#features" },
        { key: "howItWorks", href: "#how-it-works" },
        { key: "pricing", href: "#pricing" },
      ],
    },
    {
      section: "platform",
      items: [
        { key: "dashboard", href: ROUTES.DASHBOARD },
        { key: "timeline", href: ROUTES.PROJECTS },
        { key: "board", href: ROUTES.PROJECTS },
      ],
    },
    {
      section: "account",
      items: [
        { key: "signIn", href: ROUTES.LOGIN },
        { key: "signUp", href: ROUTES.SIGNUP },
        { key: "acceptInvitation", href: ROUTES.INVITATIONS_ACCEPT },
      ],
    },
  ];

  return (
    <footer className="border-t border-foreground/8 py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <TumLogo className="size-7" />
              <span className="font-bold text-lg">Tûm</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{t("tagline")}</p>
          </div>

          {/* Link sections */}
          {sections.map(({ section, items }) => (
            <div key={section}>
              <h4 className="text-sm font-semibold mb-4">{t(`sections.${section}`)}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(`links.${item.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-foreground/8 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Tûm. {t("rights")}
          </p>
          <p className="font-mono">v0.3 · phase-5-scheduling</p>
        </div>
      </div>
    </footer>
  );
}
