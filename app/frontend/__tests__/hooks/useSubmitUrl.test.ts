import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import axios from "axios";
import { useSubmitUrl } from "../../hooks/useSubmitUrl";
import type { OpenGraphPreview } from "../../types";

vi.mock("axios");

const mockPreview: OpenGraphPreview = {
  id: 1,
  url: "https://example.com",
  status: "pending",
  og_image_url: null,
  og_data: null,
  error_message: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("useSubmitUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the preview on a successful POST", async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: mockPreview });

    const { result } = renderHook(() => useSubmitUrl());
    let returned: OpenGraphPreview | null = null;

    await act(async () => {
      returned = await result.current.submitUrl("https://example.com");
    });

    expect(returned).toEqual(mockPreview);
    expect(result.current.submitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets submitting to true during the request", async () => {
    let resolve!: (v: unknown) => void;
    vi.mocked(axios.post).mockReturnValue(new Promise((r) => (resolve = r)) as never);

    const { result } = renderHook(() => useSubmitUrl());

    act(() => {
      result.current.submitUrl("https://example.com");
    });

    expect(result.current.submitting).toBe(true);
    resolve({ data: mockPreview });
  });

  it("returns null and sets error on API validation failure", async () => {
    const axiosError = {
      isAxiosError: true,
      response: { data: { errors: ["Url must be a valid HTTP or HTTPS URL"] } },
    };
    vi.mocked(axios.post).mockRejectedValue(axiosError);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    const { result } = renderHook(() => useSubmitUrl());
    let returned: OpenGraphPreview | null = mockPreview;

    await act(async () => {
      returned = await result.current.submitUrl("not-a-url");
    });

    expect(returned).toBeNull();
    expect(result.current.error).toBe("Url must be a valid HTTP or HTTPS URL");
  });

  it("returns null and sets generic error on network failure", async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error("Network Error"));
    vi.mocked(axios.isAxiosError).mockReturnValue(false);

    const { result } = renderHook(() => useSubmitUrl());
    let returned: OpenGraphPreview | null = mockPreview;

    await act(async () => {
      returned = await result.current.submitUrl("https://example.com");
    });

    expect(returned).toBeNull();
    expect(result.current.error).toBe("Failed to submit URL");
  });
});
