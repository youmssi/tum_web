import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const received = vi.hoisted(() => ({
  configuration: undefined as Record<string, unknown> | undefined,
}));

vi.mock("@scalar/api-reference-react/style.css", () => ({}));
vi.mock("next/dynamic", () => ({
  default: () =>
    function FakeScalar(props: { configuration: Record<string, unknown> }) {
      received.configuration = props.configuration;
      return null;
    },
}));

import { ApiReference } from "./api-reference";

describe("ApiReference", () => {
  it("reads the public API document, never the full one with internal routes", () => {
    render(<ApiReference />);

    expect(received.configuration?.url).toMatch(/\/v3\/api-docs\/public$/);
  });

  it("keeps the page self-contained: no hosted assistant, no developer tools", () => {
    render(<ApiReference />);

    expect(received.configuration).toMatchObject({
      agent: { disabled: true },
      showDeveloperTools: "never",
    });
  });
});
