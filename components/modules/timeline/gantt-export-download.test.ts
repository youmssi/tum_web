import { describe, expect, it } from "vitest";

import { pngScale, timelineFilename } from "./gantt-export-download";

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
