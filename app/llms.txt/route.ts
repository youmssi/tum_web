import { routing, localizedUrl } from "@/i18n/routing";
import { COMPANY, CONTACT, ROUTES } from "@/lib/constants";
import { env } from "@/lib/env";

export const dynamic = "force-static";

export function GET() {
  const locales = routing.locales.map((l) => `- [${l}](${localizedUrl(l)})`).join("\n");
  const body = `# Tûm

> Tûm is a project execution and workflow visibility platform: tasks, Kanban boards, Gantt timelines with dependencies and critical path, workload views, baselines, portfolio dashboards and analytics in one workspace. Available in English and French.

Tûm is built and operated by ${COMPANY.NAME} (${COMPANY.URL}). The source code is licensed under the GNU AGPLv3.

## Product

- [Home](${env.siteUrl}): overview and interactive Gantt demo
- [Features](${env.siteUrl}${ROUTES.FEATURES}): timeline, scheduling, workload, dependencies, comparison
- [Pricing](${env.siteUrl}${ROUTES.PRICING}): Free, Pro and Enterprise cloud plans in USD, plus the free self-hosted Community edition
- [Legal notice](${env.siteUrl}${ROUTES.LEGAL}): publisher and registration details
- [Sign up](${env.siteUrl}/signup): create a workspace
- [Sign in](${env.siteUrl}/login)

## Languages

${locales}

## Company

- [${COMPANY.NAME}](${COMPANY.URL})
- [Terms of Service](${env.siteUrl}${ROUTES.TERMS})
- [Privacy Policy](${env.siteUrl}${ROUTES.PRIVACY})

## Contact

- Sales and general enquiries: ${CONTACT.EMAIL} (mention "${CONTACT.PRODUCT_REFERENCE}" in the subject)
- Support: ${CONTACT.SUPPORT_EMAIL} (mention "${CONTACT.PRODUCT_REFERENCE}" in the subject)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
