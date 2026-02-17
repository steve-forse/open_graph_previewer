class OpenGraphPreview < ApplicationRecord
  MAX_RETRIES = 3

  enum :status, {
    pending: "pending",
    processing: "processing",
    completed: "completed",
    failed: "failed"
  }

  validates :url, presence: true, format: {
    with: URI::DEFAULT_PARSER.make_regexp(%w[http https]),
    message: "must be a valid HTTP or HTTPS URL"
  }

  scope :ordered, -> { order(created_at: :desc) }

  def retrying?
    pending? && retry_count > 0
  end
end
