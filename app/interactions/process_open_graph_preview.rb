class ProcessOpenGraphPreview < ApplicationInteraction
  include BroadcastablePreview

  integer :open_graph_preview_id

  RETRY_DELAYS = { 1 => 5, 2 => 15, 3 => 30 }.freeze

  def execute
    preview = OpenGraphPreview.find_by(id: open_graph_preview_id)

    unless preview
      errors.add(:base, "OpenGraphPreview not found with id: #{open_graph_preview_id}")
      return
    end

    preview.processing!
    broadcast_preview_update(preview)

    outcome = FetchOpenGraphData.run(url: preview.url)

    if outcome.valid?
      preview.update!(
        status: :completed,
        og_data: outcome.result,
        og_image_url: outcome.result["og:image"]
      )
      broadcast_preview_update(preview)
    else
      handle_failure(preview, outcome.errors.full_messages.join(", "))
    end

    preview
  end

  private

  def handle_failure(preview, error_message)
    if preview.retry_count < OpenGraphPreview::MAX_RETRIES
      next_attempt = preview.retry_count + 1
      delay = RETRY_DELAYS[next_attempt]

      preview.update!(
        status: :pending,
        retry_count: next_attempt,
        error_message: error_message
      )

      broadcast_notification(
        "Retrying... attempt #{next_attempt}/#{OpenGraphPreview::MAX_RETRIES}",
        type: "warning"
      )
      broadcast_preview_update(preview)

      ProcessOpenGraphPreviewJob.set(wait: delay.seconds).perform_later(preview.id)
    else
      preview.update!(
        status: :failed,
        error_message: error_message,
        og_data: nil
      )
      broadcast_preview_update(preview)
    end
  end
end
