import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../test-utils";
import { OgDataDebugDrawer } from "../../components/OgDataDebugDrawer";

const ogData = {
  "og:title": "Test Title",
  "og:image": "https://example.com/img.png",
};

describe("OgDataDebugDrawer", () => {
  it("does not render drawer content when closed", () => {
    render(
      <OgDataDebugDrawer
        opened={false}
        onClose={vi.fn()}
        ogData={ogData}
        url="https://example.com"
      />
    );
    expect(screen.queryByText("OG Data Debug")).not.toBeInTheDocument();
  });

  it("renders the drawer title when open", async () => {
    render(
      <OgDataDebugDrawer
        opened={true}
        onClose={vi.fn()}
        ogData={ogData}
        url="https://example.com"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("OG Data Debug")).toBeInTheDocument();
    });
  });

  it("displays the URL when open", async () => {
    render(
      <OgDataDebugDrawer
        opened={true}
        onClose={vi.fn()}
        ogData={ogData}
        url="https://example.com"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("https://example.com")).toBeInTheDocument();
    });
  });

  it("renders the og_data as formatted JSON when open", async () => {
    render(
      <OgDataDebugDrawer
        opened={true}
        onClose={vi.fn()}
        ogData={ogData}
        url="https://example.com"
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/og:title/)).toBeInTheDocument();
      expect(screen.getByText(/Test Title/)).toBeInTheDocument();
    });
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <OgDataDebugDrawer
        opened={true}
        onClose={onClose}
        ogData={ogData}
        url="https://example.com"
      />
    );
    // Wait for the drawer to be visible, then click Mantine's close button
    await waitFor(() => {
      expect(screen.getByText("OG Data Debug")).toBeInTheDocument();
    });
    const closeButton = container.ownerDocument.querySelector(".mantine-Drawer-close") as HTMLElement;
    closeButton.click();
    expect(onClose).toHaveBeenCalled();
  });
});
