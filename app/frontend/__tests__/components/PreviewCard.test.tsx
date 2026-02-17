import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { render } from "../test-utils";
import { PreviewCard } from "../../components/PreviewCard";
import type { OpenGraphPreview } from "../../types";

// Unit-test PreviewCard in isolation; OgDataDebugDrawer is tested separately.
vi.mock("../../components/OgDataDebugDrawer", () => ({
  OgDataDebugDrawer: ({ opened, url }: { opened: boolean; url: string }) =>
    opened ? <div data-testid="debug-drawer">{url}</div> : null,
}));

const base: OpenGraphPreview = {
  id: 1,
  url: "https://example.com",
  status: "pending",
  og_image_url: null,
  og_data: null,
  error_message: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("PreviewCard", () => {
  it("renders the URL as a link", () => {
    render(<PreviewCard preview={base} />);
    const link = screen.getByRole("link", { name: /example\.com/ });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  describe("pending status", () => {
    it("shows a pending badge", () => {
      render(<PreviewCard preview={base} />);
      expect(screen.getByText("pending")).toBeInTheDocument();
    });

    it("shows a skeleton placeholder", () => {
      const { container } = render(<PreviewCard preview={base} />);
      expect(container.querySelector(".mantine-Skeleton-root")).toBeInTheDocument();
    });

    it("does not show the debug button when og_data is null", () => {
      render(<PreviewCard preview={base} />);
      expect(screen.queryByTitle("Debug OG data")).not.toBeInTheDocument();
    });
  });

  describe("processing status", () => {
    it("shows a processing badge and skeleton", () => {
      const { container } = render(<PreviewCard preview={{ ...base, status: "processing" }} />);
      expect(screen.getByText("processing")).toBeInTheDocument();
      expect(container.querySelector(".mantine-Skeleton-root")).toBeInTheDocument();
    });
  });

  describe("completed status with image", () => {
    const completed: OpenGraphPreview = {
      ...base,
      status: "completed",
      og_image_url: "https://example.com/image.png",
      og_data: { "og:title": "Example", "og:image": "https://example.com/image.png" },
    };

    it("shows a completed badge", () => {
      render(<PreviewCard preview={completed} />);
      expect(screen.getByText("completed")).toBeInTheDocument();
    });

    it("renders the og:image", () => {
      render(<PreviewCard preview={completed} />);
      const img = screen.getByRole("img", { name: "Open Graph preview" });
      expect(img).toHaveAttribute("src", "https://example.com/image.png");
    });

    it("does not show the skeleton", () => {
      const { container } = render(<PreviewCard preview={completed} />);
      expect(container.querySelector(".mantine-Skeleton-root")).not.toBeInTheDocument();
    });

    it("shows the debug button when og_data is present", () => {
      render(<PreviewCard preview={completed} />);
      expect(screen.getByTitle("Debug OG data")).toBeInTheDocument();
    });

    it("opens the debug drawer when the debug button is clicked", () => {
      render(<PreviewCard preview={completed} />);
      expect(screen.queryByTestId("debug-drawer")).not.toBeInTheDocument();
      fireEvent.click(screen.getByTitle("Debug OG data"));
      expect(screen.getByTestId("debug-drawer")).toBeInTheDocument();
    });
  });

  describe("completed status without image", () => {
    it("shows the no-image message", () => {
      render(<PreviewCard preview={{ ...base, status: "completed", og_data: { "og:title": "x" } }} />);
      expect(screen.getByText("No og:image found")).toBeInTheDocument();
    });
  });

  describe("failed status", () => {
    const failed: OpenGraphPreview = {
      ...base,
      status: "failed",
      error_message: "Connection refused",
    };

    it("shows a failed badge", () => {
      render(<PreviewCard preview={failed} />);
      expect(screen.getByText("failed")).toBeInTheDocument();
    });

    it("displays the error message", () => {
      render(<PreviewCard preview={failed} />);
      expect(screen.getByText("Connection refused")).toBeInTheDocument();
    });

    it("shows fallback message when error_message is null", () => {
      render(<PreviewCard preview={{ ...failed, error_message: null }} />);
      expect(screen.getByText("An unknown error occurred")).toBeInTheDocument();
    });
  });
});
