require "rails_helper"

RSpec.describe "Api::V1::OpenGraphPreviews" do
  describe "POST /api/v1/open_graph_previews" do
    context "with a valid URL" do
      before { ActiveJob::Base.queue_adapter = :test }

      it "creates a preview and returns 201" do
        expect {
          post "/api/v1/open_graph_previews", params: { url: "https://example.com" }, as: :json
        }.to change(OpenGraphPreview, :count).by(1)
          .and have_enqueued_job(ProcessOpenGraphPreviewJob)

        expect(response).to have_http_status(:created)

        json = response.parsed_body
        expect(json["url"]).to eq("https://example.com")
        expect(json["status"]).to eq("pending")
      end
    end

    context "with an invalid URL" do
      it "returns 422 with errors" do
        post "/api/v1/open_graph_previews", params: { url: "not-a-url" }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)

        json = response.parsed_body
        expect(json["errors"]).to be_present
      end
    end
  end

  describe "DELETE /api/v1/open_graph_previews/:id" do
    before { allow(ActionCable.server).to receive(:broadcast) }

    context "when the preview exists" do
      it "destroys the preview and returns 204" do
        preview = create(:open_graph_preview)

        expect {
          delete "/api/v1/open_graph_previews/#{preview.id}", as: :json
        }.to change(OpenGraphPreview, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "broadcasts a delete message" do
        preview = create(:open_graph_preview)
        delete "/api/v1/open_graph_previews/#{preview.id}", as: :json

        expect(ActionCable.server).to have_received(:broadcast).with(
          "open_graph_previews",
          hash_including(type: "delete", id: preview.id)
        )
      end
    end

    context "when the preview does not exist" do
      it "returns 404" do
        delete "/api/v1/open_graph_previews/0", as: :json

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "GET /api/v1/open_graph_previews" do
    it "returns all previews ordered newest-first" do
      old = create(:open_graph_preview, created_at: 2.days.ago)
      new_preview = create(:open_graph_preview, :completed, created_at: 1.hour.ago)

      get "/api/v1/open_graph_previews", as: :json

      expect(response).to have_http_status(:ok)

      json = response.parsed_body
      expect(json.length).to eq(2)
      expect(json.first["id"]).to eq(new_preview.id)
      expect(json.last["id"]).to eq(old.id)
    end

    it "includes og_data in the response" do
      create(:open_graph_preview, :completed)

      get "/api/v1/open_graph_previews", as: :json

      json = response.parsed_body
      expect(json.first["og_data"]).to be_a(Hash)
      expect(json.first["og_data"]).to include("og:title")
    end
  end
end
