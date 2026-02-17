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
  Popover,
  Button,
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
  onDelete: (id: number) => void;
}

export function PreviewCard({ preview, onDelete }: PreviewCardProps) {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [deletePopoverOpened, setDeletePopoverOpened] = useState(false);

  const isPending = preview.status === "pending" || preview.status === "processing";
  const isFailed = preview.status === "failed";
  const isCompleted = preview.status === "completed";

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="sm">
          <Group justify="space-between">
            <Group gap="xs">
              <Badge color={STATUS_COLORS[preview.status]} variant="filled">
                {preview.status}
              </Badge>
              {preview.status === "pending" && preview.retry_count > 0 && (
                <Text size="xs" c="orange">
                  Retrying… ({preview.retry_count}/{3})
                </Text>
              )}
            </Group>
            <Group gap="xs">
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
              <Popover
                opened={deletePopoverOpened}
                onChange={setDeletePopoverOpened}
                position="bottom-end"
                withArrow
              >
                <Popover.Target>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => setDeletePopoverOpened(true)}
                    title="Delete preview"
                  >
                    🗑
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                  <Stack gap="xs">
                    <Text size="sm">Delete this preview?</Text>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        color="red"
                        onClick={() => {
                          setDeletePopoverOpened(false);
                          onDelete(preview.id);
                        }}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => setDeletePopoverOpened(false)}
                      >
                        Cancel
                      </Button>
                    </Group>
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            </Group>
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
