import { loader } from "fumadocs-core/source";

import { docs } from "@/.source/server";
import { ROUTES } from "@/lib/constants";

import { docsI18n } from "./i18n";

export const docsSource = loader({
  baseUrl: ROUTES.DOCS,
  source: docs.toFumadocsSource(),
  i18n: docsI18n,
});
