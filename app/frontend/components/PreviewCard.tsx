import { useState } from "react";
import {
  Card,
  Badge,
  Text,
  Image,
  Skeleton,
  Group,
  Anchor,
  ActionIcon,
  Stack,
} from "@mantine/core";
import type { OpenGraphPreview } from "../types";
import { OgDataDebugDrawer } from "./OgDataDebugDrawer";

const STATUS_COLORS: Record<OpenGraphPreview["status"], string> = {
  pending: "yellow",
  processing: "blue",
  completed: "green",
  failed: "red",
};

interface PreviewCardProps {
  preview: OpenGraphPreview;
}

export function PreviewCard({ preview }: PreviewCardProps) {
  const [drawerOpened, setDrawerOpened] = useState(false);

  const isPending = preview.status === "pending" || preview.status === "processing";
  const isFailed = preview.status === "failed";
  const isCompleted = preview.status === "completed";

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="sm">
          <Group justify="space-between">
            <Badge color={STATUS_COLORS[preview.status]} variant="filled">
              {preview.status}
            </Badge>
            {preview.og_data && (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setDrawerOpened(true)}
                title="Debug OG data"
              >
                🔍
              </ActionIcon>
            )}
          </Group>

          <Anchor href={preview.url} target="_blank" rel="noopener noreferrer" lineClamp={1}>
            {preview.url}
          </Anchor>

          {isPending && <Skeleton height={200} radius="md" />}

          {isCompleted && preview.og_image_url && (
            <Image
              src={preview.og_image_url}
              alt="Open Graph preview"
              radius="md"
              fit="contain"
              mah={300}
              fallbackSrc="https://placehold.co/600x300?text=No+Image"
            />
          )}

          {isCompleted && !preview.og_image_url && (
            <Text c="dimmed" size="sm" fs="italic">
              No og:image found
            </Text>
          )}

          {isFailed && (
            <Text c="red" size="sm">
              {preview.error_message || "An unknown error occurred"}
            </Text>
          )}
        </Stack>
      </Card>

      <OgDataDebugDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        ogData={preview.og_data}
        url={preview.url}
      />
    </>
  );
}
