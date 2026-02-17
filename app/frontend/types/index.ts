export interface OpenGraphPreview {
  id: number;
  url: string;
  status: "pending" | "processing" | "completed" | "failed";
  og_image_url: string | null;
  og_data: Record<string, string> | null;
  error_message: string | null;
  created_at: string;
}
