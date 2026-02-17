FactoryBot.define do
  factory :open_graph_preview do
    url { Faker::Internet.url(scheme: "https") }
    status { "pending" }

    trait :processing do
      status { "processing" }
    end

    trait :completed do
      status { "completed" }
      og_image_url { "https://example.com/image.png" }
      og_data do
        {
          "og:title" => "Example Page",
          "og:type" => "website",
          "og:url" => "https://example.com",
          "og:image" => "https://example.com/image.png",
          "og:description" => "An example page for testing"
        }
      end
    end

    trait :failed do
      status { "failed" }
      error_message { "HTTP request failed: Connection refused" }
      og_data { nil }
    end
  end
end
