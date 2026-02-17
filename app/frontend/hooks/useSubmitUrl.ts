import { useState } from "react";
import axios from "axios";
import type { OpenGraphPreview } from "../types";

interface UseSubmitUrlResult {
  submitUrl: (url: string) => Promise<OpenGraphPreview | null>;
  submitting: boolean;
  error: string | null;
}

export function useSubmitUrl(): UseSubmitUrlResult {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitUrl = async (url: string): Promise<OpenGraphPreview | null> => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post<OpenGraphPreview>(
        "/api/v1/open_graph_previews",
        { url }
      );
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        const message = err.response.data.errors.join(", ");
        setError(message);
      } else {
        setError("Failed to submit URL");
      }
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitUrl, submitting, error };
}
