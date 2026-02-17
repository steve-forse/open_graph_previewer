import { render, type RenderOptions } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  return <MantineProvider>{children}</MantineProvider>;
}

function renderWithMantine(ui: ReactNode, options?: RenderOptions) {
  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { renderWithMantine as render };
