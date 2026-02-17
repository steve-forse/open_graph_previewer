class ProcessOpenGraphPreview < ApplicationInteraction
  integer :open_graph_preview_id

  def execute
    preview = OpenGraphPreview.find_by(id: open_graph_preview_id)

    unless preview
      errors.add(:base, "OpenGraphPreview not found with id: #{open_graph_preview_id}")
      return
    end

    preview.processing!

    outcome = FetchOpenGraphData.run(url: preview.url)

    if outcome.valid?
      preview.update!(
        status: :completed,
        og_data: outcome.result,
        og_image_url: outcome.result["og:image"]
      )
    else
      preview.update!(
        status: :failed,
        error_message: outcome.errors.full_messages.join(", "),
        og_data: nil
      )
    end

    preview
  end
end
