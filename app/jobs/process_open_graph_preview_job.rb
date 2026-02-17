class ProcessOpenGraphPreviewJob < ApplicationJob
  queue_as :default

  def perform(open_graph_preview_id)
    Rails.logger.info "Processing OpenGraphPreview ##{open_graph_preview_id}"

    ProcessOpenGraphPreview.run!(open_graph_preview_id: open_graph_preview_id)
  rescue ActiveInteraction::InvalidInteractionError => e
    Rails.logger.error "ProcessOpenGraphPreviewJob failed for ##{open_graph_preview_id}: #{e.message}"
  end
end
