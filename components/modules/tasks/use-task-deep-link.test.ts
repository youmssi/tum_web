import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockReplace, params } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  params: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({ useSearchParams: () => params.current }));
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ replace: mockReplace }) }));

import { useTaskDeepLink } from "./use-task-deep-link";

const tasks = [{ id: "a" }, { id: "b" }];

describe("useTaskDeepLink", () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it("opens the task named in the URL once tasks are loaded", () => {
    params.current = new URLSearchParams("task=b&from=2026-01-01");
    const open = vi.fn();
    const { rerender } = renderHook(({ list }) => useTaskDeepLink(list, open), {
      initialProps: { list: undefined as typeof tasks | undefined },
    });
    expect(open).not.toHaveBeenCalled();

    rerender({ list: tasks });
    rerender({ list: [...tasks] });
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith({ id: "b" });
  });

  it("ignores unknown task ids", () => {
    params.current = new URLSearchParams("task=zzz");
    const open = vi.fn();
    renderHook(() => useTaskDeepLink(tasks, open));
    expect(open).not.toHaveBeenCalled();
  });

  it("drops only the task parameter when the sheet closes", () => {
    params.current = new URLSearchParams("task=b&from=2026-01-01");
    const { result } = renderHook(() => useTaskDeepLink(tasks, vi.fn()));
    result.current();
    expect(mockReplace).toHaveBeenCalledWith("?from=2026-01-01", { scroll: false });
  });

  it("does nothing on close without a task parameter", () => {
    params.current = new URLSearchParams("from=2026-01-01");
    const { result } = renderHook(() => useTaskDeepLink(tasks, vi.fn()));
    result.current();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
