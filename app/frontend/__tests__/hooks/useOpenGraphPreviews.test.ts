import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import axios from "axios";
import { useOpenGraphPreviews } from "../../hooks/useOpenGraphPreviews";
import type { OpenGraphPreview } from "../../types";

vi.mock("axios");

// Track the latest subscription's received callback so tests can trigger messages
let capturedReceived: ((data: unknown) => void) | null = null;
let mockDisconnect: ReturnType<typeof vi.fn>;

vi.mock("@rails/actioncable", () => ({
  createConsumer: () => {
    mockDisconnect = vi.fn();
    return {
      subscriptions: {
        create: (_channel: string, handlers: { received: (data: unknown) => void }) => {
          capturedReceived = handlers.received;
          return {};
        },
      },
      disconnect: mockDisconnect,
    };
  },
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

const makePreview = (id: number): OpenGraphPreview => ({
  id,
  url: `https://example-${id}.com`,
  status: "pending",
  og_image_url: null,
  og_data: null,
  error_message: null,
  retry_count: 0,
  created_at: new Date().toISOString(),
});

describe("useOpenGraphPreviews", () => {
  beforeEach(() => {
    capturedReceived = null;
    vi.clearAllMocks();
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

  it("disconnects the ActionCable consumer on unmount", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] });

    const { unmount } = renderHook(() => useOpenGraphPreviews());
    await act(async () => { await Promise.resolve(); });

    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("upserts a preview when an update message is received", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [makePreview(1)] });

    const { result } = renderHook(() => useOpenGraphPreviews());
    await act(async () => { await Promise.resolve(); });

    const updated = { ...makePreview(1), status: "completed" as const };
    act(() => {
      capturedReceived?.({ type: "update", preview: updated });
    });

    expect(result.current.previews[0].status).toBe("completed");
  });

  it("removes a preview when a delete message is received", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [makePreview(1), makePreview(2)] });

    const { result } = renderHook(() => useOpenGraphPreviews());
    await act(async () => { await Promise.resolve(); });

    act(() => {
      capturedReceived?.({ type: "delete", id: 1 });
    });

    expect(result.current.previews).toHaveLength(1);
    expect(result.current.previews[0].id).toBe(2);
  });

  it("shows a Mantine notification when a notification message is received", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] });
    const { notifications } = await import("@mantine/notifications");

    const { result: _result } = renderHook(() => useOpenGraphPreviews());
    await act(async () => { await Promise.resolve(); });

    act(() => {
      capturedReceived?.({ type: "notification", message: "Retrying... attempt 1/3", notification_type: "warning" });
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Retrying... attempt 1/3", color: "orange" })
    );
  });
});
