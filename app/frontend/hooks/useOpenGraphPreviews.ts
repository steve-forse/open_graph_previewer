import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { createConsumer } from "@rails/actioncable";
import { notifications } from "@mantine/notifications";
import type { OpenGraphPreview } from "../types";

type CableMessage =
  | { type: "update"; preview: OpenGraphPreview }
  | { type: "delete"; id: number }
  | { type: "notification"; message: string; notification_type: string };

export function useOpenGraphPreviews() {
  const [previews, setPreviews] = useState<OpenGraphPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const consumerRef = useRef<ReturnType<typeof createConsumer> | null>(null);

  const fetchPreviews = useCallback(async () => {
    try {
      const response = await axios.get<OpenGraphPreview[]>(
        "/api/v1/open_graph_previews"
      );
      setPreviews(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch previews");
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePreview = useCallback(async (id: number) => {
    await axios.delete(`/api/v1/open_graph_previews/${id}`);
  }, []);

  useEffect(() => {
    fetchPreviews();

    const consumer = createConsumer("/cable");
    consumerRef.current = consumer;

    consumer.subscriptions.create("OpenGraphPreviewsChannel", {
      received(data: CableMessage) {
        if (data.type === "update") {
          setPreviews((prev) => {
            const idx = prev.findIndex((p) => p.id === data.preview.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = data.preview;
              return next;
            }
            return [data.preview, ...prev];
          });
        } else if (data.type === "delete") {
          setPreviews((prev) => prev.filter((p) => p.id !== data.id));
        } else if (data.type === "notification") {
          notifications.show({
            message: data.message,
            color: "orange",
            autoClose: 5000,
          });
        }
      },
    });

    return () => {
      consumer.disconnect();
    };
  }, [fetchPreviews]);

  return { previews, loading, error, deletePreview, refetch: fetchPreviews };
}
