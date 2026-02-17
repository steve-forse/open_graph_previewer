import { Stack, Text, Loader, Center } from "@mantine/core";
import type { OpenGraphPreview } from "../types";
import { PreviewCard } from "./PreviewCard";

interface PreviewListProps {
  previews: OpenGraphPreview[];
  loading: boolean;
  onDelete: (id: number) => void;
}

export function PreviewList({ previews, loading, onDelete }: PreviewListProps) {
  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (previews.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No previews yet. Submit a URL above to get started.
      </Text>
    );
  }

  return (
    <Stack gap="md">
      {previews.map((preview) => (
        <PreviewCard key={preview.id} preview={preview} onDelete={onDelete} />
      ))}
    </Stack>
  );
}
