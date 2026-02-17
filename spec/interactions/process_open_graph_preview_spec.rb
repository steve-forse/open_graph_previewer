require "rails_helper"

RSpec.describe ProcessOpenGraphPreview do
  let(:html_with_og) do
    <<~HTML
      <html><head>
        <meta property="og:title" content="Test">
        <meta property="og:image" content="https://example.com/img.png">
      </head></html>
    HTML
  end

  let(:html_without_image) do
    <<~HTML
      <html><head>
        <meta property="og:title" content="No Image">
      </head></html>
    HTML
  end

  describe "#execute" do
    context "when fetch succeeds with og:image" do
      let(:preview) { create(:open_graph_preview, url: "https://example.com") }

      before do
        stub_request(:get, "https://example.com").to_return(status: 200, body: html_with_og)
      end

      it "transitions from pending to processing to completed" do
        expect(preview.status).to eq("pending")

        described_class.run!(open_graph_preview_id: preview.id)
        preview.reload

        expect(preview.status).to eq("completed")
      end

      it "persists og_data and extracts og_image_url" do
        described_class.run!(open_graph_preview_id: preview.id)
        preview.reload

        expect(preview.og_data).to include("og:title" => "Test", "og:image" => "https://example.com/img.png")
        expect(preview.og_image_url).to eq("https://example.com/img.png")
      end
    end

    context "when og:image is not present" do
      let(:preview) { create(:open_graph_preview, url: "https://example.com") }

      before do
        stub_request(:get, "https://example.com").to_return(status: 200, body: html_without_image)
      end

      it "sets og_image_url to nil" do
        described_class.run!(open_graph_preview_id: preview.id)
        preview.reload

        expect(preview.og_data).to eq("og:title" => "No Image")
        expect(preview.og_image_url).to be_nil
      end
    end

    context "when fetch fails" do
      let(:preview) { create(:open_graph_preview, url: "https://example.com") }

      before do
        stub_request(:get, "https://example.com").to_raise(SocketError.new("fail"))
      end

      it "transitions to failed with an error message" do
        described_class.run(open_graph_preview_id: preview.id)
        preview.reload

        expect(preview.status).to eq("failed")
        expect(preview.error_message).to include("HTTP request failed")
        expect(preview.og_data).to be_nil
      end
    end

    context "when record is not found" do
      it "adds an error" do
        result = described_class.run(open_graph_preview_id: -1)
        expect(result).not_to be_valid
        expect(result.errors[:base]).to include(a_string_matching(/not found/))
      end
    end
  end
end
