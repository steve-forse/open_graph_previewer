class CreateOpenGraphPreview < ApplicationInteraction
  string :url

  def execute
    preview = OpenGraphPreview.new(url: url, status: :pending)

    if preview.save
      preview
    else
      preview.errors.each do |error|
        errors.add(error.attribute, error.message)
      end
      nil
    end
  end
end
