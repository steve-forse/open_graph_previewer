require "rails_helper"

RSpec.describe CreateOpenGraphPreview do
  describe "#execute" do
    context "with a valid URL" do
      it "creates a record with pending status" do
        result = described_class.run!(url: "https://example.com")

        expect(result).to be_a(OpenGraphPreview)
        expect(result).to be_persisted
        expect(result.status).to eq("pending")
        expect(result.url).to eq("https://example.com")
      end
    end

    context "with an invalid URL" do
      it "returns errors" do
        result = described_class.run(url: "not-a-url")
        expect(result).not_to be_valid
        expect(result.errors[:url]).to be_present
      end
    end

    context "with an empty URL" do
      it "returns errors" do
        result = described_class.run(url: "")
        expect(result).not_to be_valid
      end
    end
  end
end
