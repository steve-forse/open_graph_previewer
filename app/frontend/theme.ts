import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "violet",
  defaultRadius: "md",
  components: {
    Button: { defaultProps: { variant: "filled" } },
    Card: { defaultProps: { shadow: "sm", withBorder: true } },
    TextInput: { defaultProps: { variant: "filled" } },
    ActionIcon: { defaultProps: { variant: "subtle" } },
    Badge: { defaultProps: { variant: "filled" } },
  },
});
