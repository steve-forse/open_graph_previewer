import { MantineProvider, Container, Title, Stack, Group, Text } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { IconWorldWww } from "@tabler/icons-react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { theme } from "../theme";
import { useOpenGraphPreviews } from "../hooks/useOpenGraphPreviews";
import { UrlForm } from "./UrlForm";
import { PreviewList } from "./PreviewList";

export function App() {
  const { previews, loading, deletePreview } = useOpenGraphPreviews();

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" />
      <Container size="md" py="xl">
        <Stack gap="lg">
          <div>
            <Group gap="xs">
              <IconWorldWww size={32} color="var(--mantine-color-violet-4)" />
              <Title order={1}>Open Graph Previewer</Title>
            </Group>
            <Text c="dimmed" size="sm" mt={4}>
              Fetch and preview Open Graph metadata from any URL
            </Text>
          </div>
          <UrlForm />
          <PreviewList previews={previews} loading={loading} onDelete={deletePreview} />
        </Stack>
      </Container>
    </MantineProvider>
  );
}
