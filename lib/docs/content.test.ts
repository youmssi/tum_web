// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const DIR = join(process.cwd(), "content/docs");
const files = readdirSync(DIR);
const englishPages = files.filter((f) => f.endsWith(".mdx") && !f.endsWith(".fr.mdx"));
const meta = JSON.parse(readFileSync(join(DIR, "meta.json"), "utf8")) as { pages: string[] };

function frontmatter(file: string) {
  const match = /^---\n([\s\S]*?)\n---/.exec(readFileSync(join(DIR, file), "utf8"));
  return match?.[1] ?? "";
}

describe("docs content", () => {
  it.each(englishPages)("%s has a French translation", (file) => {
    expect(files).toContain(file.replace(/\.mdx$/, ".fr.mdx"));
  });

  it.each(files.filter((f) => f.endsWith(".mdx")))("%s has a title and description", (file) => {
    const fm = frontmatter(file);
    expect(fm).toMatch(/^title: .+/m);
    expect(fm).toMatch(/^description: .+/m);
  });

  it("lists every page in the sidebar order exactly once", () => {
    const slugs = englishPages.map((f) => f.replace(/\.mdx$/, "")).sort();
    expect([...meta.pages].sort()).toEqual(slugs);
  });

  it("uses no em dashes, matching the house style", () => {
    const offenders = files
      .filter((f) => f.endsWith(".mdx"))
      .filter((f) => readFileSync(join(DIR, f), "utf8").includes("—"));
    expect(offenders).toEqual([]);
  });
});
