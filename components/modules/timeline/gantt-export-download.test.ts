import { afterEach, describe, expect, it, vi } from "vitest";

import { loadLogoDataUri, pngScale, timelineFilename } from "./gantt-export-download";

describe("timelineFilename", () => {
  it("slugs the project name and stamps the date", () => {
    const date = new Date("2026-11-15T10:00:00Z");
    expect(timelineFilename("Lancement Été 2026!", "png", date)).toBe(
      "lancement-ete-2026-timeline-2026-11-15.png",
    );
    expect(timelineFilename("***", "pdf", date)).toBe("project-timeline-2026-11-15.pdf");
  });
});

describe("pngScale", () => {
  it("renders at twice the size when it fits", () => {
    expect(pngScale(1_600, 900)).toBe(2);
  });

  it("shrinks the ratio so a very wide chart stays within canvas limits", () => {
    expect(pngScale(12_000, 900) * 12_000).toBeLessThanOrEqual(16_000);
  });
});

describe("loadLogoDataUri", () => {
  afterEach(() => vi.unstubAllGlobals());

  function serve(body: BlobPart, type: string, ok = true) {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok, blob: () => Promise.resolve(new Blob([body], { type })) })),
    );
  }

  it("inlines a raster logo as a data URI", async () => {
    serve(new Uint8Array([137, 80, 78, 71]), "image/png");

    expect(await loadLogoDataUri("https://files.example.test/logo.png")).toMatch(
      /^data:image\/png;base64,/,
    );
  });

  it("gives up quietly on a missing, failed, unsupported or unreachable logo", async () => {
    expect(await loadLogoDataUri(null)).toBeUndefined();

    serve("x", "image/png", false);
    expect(await loadLogoDataUri("https://files.example.test/expired.png")).toBeUndefined();

    serve("<svg/>", "image/svg+xml");
    expect(await loadLogoDataUri("https://files.example.test/logo.svg")).toBeUndefined();

    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("blocked"))),
    );
    expect(await loadLogoDataUri("https://files.example.test/logo.png")).toBeUndefined();
  });
});
