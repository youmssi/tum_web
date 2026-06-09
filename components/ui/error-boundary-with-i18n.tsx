"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ErrorBoundary } from "./error-boundary";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wraps {@link ErrorBoundary} with translated strings from the `errorBoundary`
 * message namespace. Falls back to the {@link ErrorBoundary}'s built-in English
 * defaults if the i18n provider is unavailable.
 */
export function ErrorBoundaryWithI18n({ children, fallback }: Props) {
  const t = useTranslations("errorBoundary");

  return (
    <ErrorBoundary
      fallback={fallback}
      title={t("title")}
      description={t("description")}
      refreshLabel={t("refresh")}
      dashboardLabel={t("dashboard")}
    >
      {children}
    </ErrorBoundary>
  );
}
