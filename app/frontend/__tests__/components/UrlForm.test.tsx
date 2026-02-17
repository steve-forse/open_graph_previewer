import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test-utils";
import { UrlForm } from "../../components/UrlForm";

vi.mock("../../hooks/useSubmitUrl");

import { useSubmitUrl } from "../../hooks/useSubmitUrl";
import type { OpenGraphPreview } from "../../types";

const mockPreview: OpenGraphPreview = {
  id: 1,
  url: "https://example.com",
  status: "pending",
  og_image_url: null,
  og_data: null,
  error_message: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("UrlForm", () => {
  beforeEach(() => {
    vi.mocked(useSubmitUrl).mockReturnValue({
      submitUrl: vi.fn().mockResolvedValue(mockPreview),
      submitting: false,
      error: null,
    });
  });

  it("renders the URL input and submit button", () => {
    render(<UrlForm onPreviewCreated={vi.fn()} />);
    expect(screen.getByPlaceholderText("https://example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /fetch preview/i })).toBeInTheDocument();
  });

  it("calls onPreviewCreated and clears input on successful submit", async () => {
    const onPreviewCreated = vi.fn();
    render(<UrlForm onPreviewCreated={onPreviewCreated} />);

    await userEvent.type(screen.getByPlaceholderText("https://example.com"), "https://example.com");
    await userEvent.click(screen.getByRole("button", { name: /fetch preview/i }));

    await waitFor(() => {
      expect(onPreviewCreated).toHaveBeenCalledWith(mockPreview);
    });
    expect(screen.getByPlaceholderText("https://example.com")).toHaveValue("");
  });

  it("does not submit when the input is empty", async () => {
    const submitUrl = vi.fn().mockResolvedValue(null);
    vi.mocked(useSubmitUrl).mockReturnValue({ submitUrl, submitting: false, error: null });

    render(<UrlForm onPreviewCreated={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /fetch preview/i }));

    expect(submitUrl).not.toHaveBeenCalled();
  });

  it("disables the input and button while submitting", () => {
    vi.mocked(useSubmitUrl).mockReturnValue({
      submitUrl: vi.fn(),
      submitting: true,
      error: null,
    });

    render(<UrlForm onPreviewCreated={vi.fn()} />);
    expect(screen.getByPlaceholderText("https://example.com")).toBeDisabled();
  });
});
