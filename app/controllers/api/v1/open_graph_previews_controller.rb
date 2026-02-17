module Api
  module V1
    class OpenGraphPreviewsController < ApplicationController
      skip_forgery_protection

      def index
        previews = OpenGraphPreview.ordered

        render json: previews.map { |p| serialize_preview(p) }, status: :ok
      end

      def create
        result = CreateOpenGraphPreview.run(url: params[:url].to_s)

        if result.valid?
          ProcessOpenGraphPreviewJob.perform_later(result.result.id)
          render json: serialize_preview(result.result), status: :created
        else
          render json: { errors: result.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def serialize_preview(preview)
        {
          id: preview.id,
          url: preview.url,
          status: preview.status,
          og_image_url: preview.og_image_url,
          og_data: preview.og_data,
          error_message: preview.error_message,
          created_at: preview.created_at
        }
      end
    end
  end
end
