class OpenGraphPreviewsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "open_graph_previews"
  end

  def unsubscribed
  end
end
