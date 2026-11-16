import { defineI18nUI } from "fumadocs-ui/i18n";

import { routing } from "@/i18n/routing";

/**
 * Docs locales mirror the app's next-intl routing ("as-needed" prefix): English pages live at
 * /docs/..., French ones at /fr/docs/.... A page without a `.fr.mdx` translation falls back to
 * English instead of 404ing.
 */
export const docsI18n = defineI18nUI(
  {
    languages: [...routing.locales],
    defaultLanguage: routing.defaultLocale,
    hideLocale: "default-locale",
    parser: "dot",
    fallbackLanguage: routing.defaultLocale,
  },
  {
    en: { displayName: "English" },
    fr: {
      displayName: "Français",
      "Search(search trigger)": "Rechercher",
      "Search(search dialog)": "Rechercher dans la documentation",
      "No results found(search dialog)": "Aucun résultat",
      "Search failed(search dialog)": "La recherche a échoué",
      "On this page(table of contents)": "Sur cette page",
      "No Headings(table of contents)": "Aucun titre",
      "Table of Contents(inline table of contents)": "Table des matières",
      "Next Page(pagination)": "Page suivante",
      "Previous Page(pagination)": "Page précédente",
      "Last updated on(page footer)": "Dernière mise à jour le",
      "Choose a language(language switcher)": "Choisir une langue",
      "Edit on GitHub(edit page)": "Modifier sur GitHub",
      "Page Not Found(404 page)": "Page introuvable",
      "Back to Home(404 page)": "Retour à l’accueil",
      "Skip to Content(skip link)": "Aller au contenu",
      "Copy Markdown(page actions)": "Copier le Markdown",
      "Copied Markdown(page actions)": "Markdown copié",
      "Open(page actions)": "Ouvrir",
    },
  },
);
