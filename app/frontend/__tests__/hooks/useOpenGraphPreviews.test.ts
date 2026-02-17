import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import axios from "axios";
import { useOpenGraphPreviews } from "../../hooks/useOpenGraphPreviews";
import type { OpenGraphPreview } from "../../types";

vi.mock("axios");

const makePreview = (id: number): OpenGraphPreview => ({
  id,
  url: `https://example-${id}.com`,
  status: "pending",
  og_image_url: null,
  og_data: null,
  error_message: null,
  created_at: new Date().toISOString(),
});

describe("useOpenGraphPreviews", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches previews on mount and sets loading to false", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [makePreview(1)] });

    const { result } = renderHook(() => useOpenGraphPreviews());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.previews).toHaveLength(1);
    expect(result.current.previews[0].id).toBe(1);
  });

  it("polls every 3 seconds", async () => {
    vi.mocked(axios.get)
      .mockResolvedValueOnce({ data: [makePreview(1)] })
      .mockResolvedValueOnce({ data: [makePreview(1), makePreview(2)] });

    const { result } = renderHook(() => useOpenGraphPreviews());

    await act(async () => { await Promise.resolve(); });
    expect(result.current.previews).toHaveLength(1);

    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(result.current.previews).toHaveLength(2);
  });

  it("sets error state when the request fails", async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useOpenGraphPreviews());

    await act(async () => { await Promise.resolve(); });

    expect(result.current.error).toBe("Failed to fetch previews");
    expect(result.current.loading).toBe(false);
  });

  it("addOptimistic prepends a preview to the list", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [makePreview(1)] });

    const { result } = renderHook(() => useOpenGraphPreviews());
    await act(async () => { await Promise.resolve(); });

    act(() => {
      result.current.addOptimistic(makePreview(99));
    });

    expect(result.current.previews[0].id).toBe(99);
    expect(result.current.previews).toHaveLength(2);
  });

  it("clears the polling interval on unmount", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] });
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const { unmount } = renderHook(() => useOpenGraphPreviews());
    await act(async () => { await Promise.resolve(); });

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
