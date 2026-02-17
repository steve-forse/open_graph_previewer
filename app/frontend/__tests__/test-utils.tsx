import { render, type RenderOptions } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";
import { theme } from "../theme";

function Wrapper({ children }: { children: ReactNode }) {
  return <MantineProvider theme={theme} defaultColorScheme="dark">{children}</MantineProvider>;
}

function renderWithMantine(ui: ReactNode, options?: RenderOptions) {
  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { renderWithMantine as render };
