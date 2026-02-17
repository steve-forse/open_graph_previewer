class CreateOpenGraphPreview < ApplicationInteraction
  include BroadcastablePreview

  string :url

  def execute
    preview = OpenGraphPreview.new(url: url, status: :pending)

    if preview.save
      broadcast_preview_update(preview)
      preview
    else
      preview.errors.each do |error|
        errors.add(error.attribute, error.message)
      end
      nil
    end
  end
end
