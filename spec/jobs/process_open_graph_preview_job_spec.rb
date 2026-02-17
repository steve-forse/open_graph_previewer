require "rails_helper"

RSpec.describe ProcessOpenGraphPreviewJob do
  describe "#perform" do
    let(:preview) { create(:open_graph_preview) }

    it "calls ProcessOpenGraphPreview.run! with the correct arguments" do
      allow(ProcessOpenGraphPreview).to receive(:run!).and_return(preview)

      described_class.perform_now(preview.id)

      expect(ProcessOpenGraphPreview).to have_received(:run!).with(open_graph_preview_id: preview.id)
    end

    it "handles ActiveInteraction::InvalidInteractionError gracefully" do
      allow(ProcessOpenGraphPreview).to receive(:run!)
        .and_raise(ActiveInteraction::InvalidInteractionError, "something went wrong")

      expect {
        described_class.perform_now(preview.id)
      }.not_to raise_error
    end
  end
end
