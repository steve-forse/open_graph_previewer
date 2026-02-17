require "rails_helper"

RSpec.describe OpenGraphPreview do
  describe "validations" do
    it { is_expected.to validate_presence_of(:url) }

    it "validates url format" do
      preview = build(:open_graph_preview, url: "not-a-url")
      expect(preview).not_to be_valid
      expect(preview.errors[:url]).to include("must be a valid HTTP or HTTPS URL")
    end

    it "accepts valid http urls" do
      preview = build(:open_graph_preview, url: "http://example.com")
      expect(preview).to be_valid
    end

    it "accepts valid https urls" do
      preview = build(:open_graph_preview, url: "https://example.com/path?q=1")
      expect(preview).to be_valid
    end
  end

  describe "enum" do
    it "defines status enum with correct values" do
      expect(described_class.statuses).to eq(
        "pending" => "pending",
        "processing" => "processing",
        "completed" => "completed",
        "failed" => "failed"
      )
    end
  end

  describe "scopes" do
    describe ".ordered" do
      it "returns records ordered by created_at descending" do
        old = create(:open_graph_preview, created_at: 2.days.ago)
        new_preview = create(:open_graph_preview, created_at: 1.hour.ago)

        expect(described_class.ordered.to_a).to eq([new_preview, old])
      end
    end
  end
end
