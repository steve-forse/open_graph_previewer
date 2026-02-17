import { Drawer, Code, Title } from "@mantine/core";

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
      title={<Title order={4}>OG Data Debug</Title>}
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
