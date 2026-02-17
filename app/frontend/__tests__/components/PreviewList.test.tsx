import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test-utils";
import { PreviewList } from "../../components/PreviewList";
import type { OpenGraphPreview } from "../../types";

const makePreviews = (count: number): OpenGraphPreview[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    url: `https://example-${i + 1}.com`,
    status: "pending" as const,
    og_image_url: null,
    og_data: null,
    error_message: null,
    created_at: new Date().toISOString(),
  }));

describe("PreviewList", () => {
  it("shows a loader while loading", () => {
    const { container } = render(<PreviewList previews={[]} loading={true} />);
    expect(container.querySelector(".mantine-Loader-root")).toBeInTheDocument();
  });

  it("shows empty state message when there are no previews", () => {
    render(<PreviewList previews={[]} loading={false} />);
    expect(screen.getByText(/no previews yet/i)).toBeInTheDocument();
  });

  it("renders a card for each preview", () => {
    const previews = makePreviews(3);
    render(<PreviewList previews={previews} loading={false} />);
    expect(screen.getByText("https://example-1.com")).toBeInTheDocument();
    expect(screen.getByText("https://example-2.com")).toBeInTheDocument();
    expect(screen.getByText("https://example-3.com")).toBeInTheDocument();
  });

  it("does not show empty state when previews exist", () => {
    render(<PreviewList previews={makePreviews(1)} loading={false} />);
    expect(screen.queryByText(/no previews yet/i)).not.toBeInTheDocument();
  });
});
