import { Drawer, Code, Title, Group } from "@mantine/core";
import { IconCode } from "@tabler/icons-react";

interface OgDataDebugDrawerProps {
  opened: boolean;
  onClose: () => void;
  ogData: Record<string, string> | null;
  url: string;
}

export function OgDataDebugDrawer({
  opened,
  onClose,
  ogData,
  url,
}: OgDataDebugDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconCode size={20} />
          <Title order={4}>OG Data Debug</Title>
        </Group>
      }
      position="right"
      size="md"
      padding="md"
    >
      <Title order={6} mb="sm" lineClamp={1}>
        {url}
      </Title>
      <Code block>{JSON.stringify(ogData, null, 2)}</Code>
    </Drawer>
  );
}
