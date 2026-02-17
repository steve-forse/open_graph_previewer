import { useState } from "react";
import { TextInput, Button, Group, Paper } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLink, IconSearch } from "@tabler/icons-react";
import { useSubmitUrl } from "../hooks/useSubmitUrl";

interface UrlFormProps {
  onSuccess?: () => void;
}

export function UrlForm({ onSuccess }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const { submitUrl, submitting } = useSubmitUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    const result = await submitUrl(url.trim());

    if (result) {
      onSuccess?.();
      setUrl("");
      notifications.show({
        title: "URL submitted",
        message: "Fetching Open Graph data...",
        color: "green",
      });
    } else {
      notifications.show({
        title: "Error",
        message: "Failed to submit URL. Please check the format and try again.",
        color: "red",
      });
    }
  };

  return (
    <Paper shadow="xs" p="md" radius="md" withBorder>
      <form onSubmit={handleSubmit}>
        <Group align="flex-end">
          <TextInput
            label="Enter a URL"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.currentTarget.value)}
            style={{ flex: 1 }}
            disabled={submitting}
            leftSection={<IconLink size={16} />}
          />
          <Button type="submit" loading={submitting} leftSection={<IconSearch size={16} />}>
            Fetch Preview
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
