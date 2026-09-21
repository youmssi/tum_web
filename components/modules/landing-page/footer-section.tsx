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
          <div className="flex items-center gap-4">
            <a
              href="https://discord.gg/JeJV9M6n"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("discord")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
            <p className="font-mono">v0.6 · phase-6-views-reporting</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
