import { useState } from "react";
import { TextInput, Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSubmitUrl } from "../hooks/useSubmitUrl";
import type { OpenGraphPreview } from "../types";

interface UrlFormProps {
  onPreviewCreated: (preview: OpenGraphPreview) => void;
}

export function UrlForm({ onPreviewCreated }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const { submitUrl, submitting } = useSubmitUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    const result = await submitUrl(url.trim());

    if (result) {
      onPreviewCreated(result);
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
    <form onSubmit={handleSubmit}>
      <Group align="flex-end">
        <TextInput
          label="Enter a URL"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          style={{ flex: 1 }}
          disabled={submitting}
        />
        <Button type="submit" loading={submitting}>
          Fetch Preview
        </Button>
      </Group>
    </form>
  );
}
