import { MantineProvider, Container, Title, Stack } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { useOpenGraphPreviews } from "../hooks/useOpenGraphPreviews";
import { UrlForm } from "./UrlForm";
import { PreviewList } from "./PreviewList";

export function App() {
  const { previews, loading, deletePreview } = useOpenGraphPreviews();

  return (
    <MantineProvider>
      <Notifications position="top-right" />
      <Container size="md" py="xl">
        <Stack gap="lg">
          <Title order={1}>Open Graph Previewer</Title>
          <UrlForm />
          <PreviewList previews={previews} loading={loading} onDelete={deletePreview} />
        </Stack>
      </Container>
    </MantineProvider>
  );
}
