import { describe, expect, it } from "vitest";

import en from "./en.json";
import fr from "./fr.json";

/**
 * Catalog parity check (TUM-E15-F4). Every locale must declare exactly the same set of keys —
 * a missing French key means the French build will fall back to English at runtime (which
 * next-intl warns about and which we treat as a bug). Adding this guard up front means the
 * full-localization epic in Phase 10 can scale to more locales without re-deriving the safety net.
 */
type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

function flatten(prefix: string, value: JsonValue, out: Set<string>) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    out.add(prefix);
    return;
  }
  for (const [k, v] of Object.entries(value)) {
    flatten(prefix ? `${prefix}.${k}` : k, v, out);
  }
}

function keys(catalog: JsonValue): Set<string> {
  const out = new Set<string>();
  flatten("", catalog, out);
  return out;
}

describe("locale catalogs", () => {
  const enKeys = keys(en);
  const frKeys = keys(fr);

  it("French catalog has every English key", () => {
    const missing = [...enKeys].filter((k) => !frKeys.has(k));
    expect(missing, `Missing French translations for: ${missing.join(", ")}`).toEqual([]);
  });

  it("French catalog has no extra keys not present in English", () => {
    const extra = [...frKeys].filter((k) => !enKeys.has(k));
    expect(extra, `Extra French keys (typos?): ${extra.join(", ")}`).toEqual([]);
  });
});
