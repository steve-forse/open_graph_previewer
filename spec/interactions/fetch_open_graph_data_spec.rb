require "rails_helper"

RSpec.describe FetchOpenGraphData do
  let(:url) { "https://example.com" }

  let(:html_with_og_tags) do
    <<~HTML
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="og:title" content="Example Title">
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://example.com">
        <meta property="og:image" content="https://example.com/image.png">
        <meta property="og:description" content="A description">
      </head>
      <body></body>
      </html>
    HTML
  end

  let(:html_without_og_tags) do
    <<~HTML
      <!DOCTYPE html>
      <html>
      <head><title>No OG Tags</title></head>
      <body></body>
      </html>
    HTML
  end

  describe "#execute" do
    context "when the page has og: tags" do
      before do
        stub_request(:get, url).to_return(status: 200, body: html_with_og_tags)
      end

      it "returns a hash of all og: properties" do
        result = described_class.run!(url: url)

        expect(result).to eq(
          "og:title" => "Example Title",
          "og:type" => "website",
          "og:url" => "https://example.com",
          "og:image" => "https://example.com/image.png",
          "og:description" => "A description"
        )
      end
    end

    context "when the page has no og: tags" do
      before do
        stub_request(:get, url).to_return(status: 200, body: html_without_og_tags)
      end

      it "returns an empty hash" do
        result = described_class.run!(url: url)
        expect(result).to eq({})
      end
    end

    context "when the HTTP request fails" do
      before do
        stub_request(:get, url).to_raise(SocketError.new("Connection failed"))
      end

      it "adds an error" do
        result = described_class.run(url: url)
        expect(result).not_to be_valid
        expect(result.errors[:base]).to include(a_string_matching(/HTTP request failed/))
      end
    end

    context "when the request times out" do
      before do
        stub_request(:get, url).to_raise(Net::ReadTimeout.new("Timeout"))
      end

      it "adds an error" do
        result = described_class.run(url: url)
        expect(result).not_to be_valid
        expect(result.errors[:base]).to include(a_string_matching(/HTTP request failed/))
      end
    end
  end
end
