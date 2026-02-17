import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import type { OpenGraphPreview } from "../types";

export function useOpenGraphPreviews() {
  const [previews, setPreviews] = useState<OpenGraphPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const addOptimistic = useCallback((preview: OpenGraphPreview) => {
    setPreviews((prev) => [preview, ...prev]);
  }, []);

  useEffect(() => {
    fetchPreviews();
    intervalRef.current = setInterval(fetchPreviews, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPreviews]);

  return { previews, loading, error, addOptimistic, refetch: fetchPreviews };
}
