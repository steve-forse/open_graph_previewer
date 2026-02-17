module BroadcastablePreview
  CHANNEL = "open_graph_previews"

  def broadcast_preview_update(preview)
    ActionCable.server.broadcast(CHANNEL, {
      type: "update",
      preview: serialize_preview(preview)
    })
  end

  def broadcast_notification(message, type: "info")
    ActionCable.server.broadcast(CHANNEL, {
      type: "notification",
      message: message,
      notification_type: type
    })
  end

  def broadcast_preview_delete(id)
    ActionCable.server.broadcast(CHANNEL, {
      type: "delete",
      id: id
    })
  end

  private

  def serialize_preview(preview)
    {
      id: preview.id,
      url: preview.url,
      status: preview.status,
      og_image_url: preview.og_image_url,
      og_data: preview.og_data,
      error_message: preview.error_message,
      retry_count: preview.retry_count,
      created_at: preview.created_at
    }
  end
end
