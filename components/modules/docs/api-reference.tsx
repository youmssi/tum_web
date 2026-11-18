"use client";

import "@scalar/api-reference-react/style.css";
import dynamic from "next/dynamic";

import { env } from "@/lib/env";

// Scalar renders a Vue app in the browser; loading it only on the client keeps it out of the
// server bundle and avoids hydration mismatches.
const ApiReferenceReact = dynamic(
  () => import("@scalar/api-reference-react").then((m) => m.ApiReferenceReact),
  { ssr: false },
);

/** The public endpoints of the Tûm API, read live from the backend's OpenAPI document. */
export const PUBLIC_API_SPEC_PATH = "/v3/api-docs/public";

export function ApiReference() {
  return (
    <ApiReferenceReact
      configuration={{
        url: `${env.apiBaseUrl}${PUBLIC_API_SPEC_PATH}`,
        hideClientButton: true,
        showDeveloperTools: "never",
        // Scalar's chat assistant sends questions to its own service; keep the page self-contained.
        agent: { disabled: true },
        hideDarkModeToggle: true,
        withDefaultFonts: false,
      }}
    />
  );
}
