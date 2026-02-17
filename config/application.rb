require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module OpenGraphPreviewer
  class Application < Rails::Application
    config.load_defaults 8.1

    config.autoload_lib(ignore: %w[assets tasks])

    # Use solid_queue as the ActiveJob backend
    config.active_job.queue_adapter = :solid_queue

    # API-only responses from api namespace; full stack for root SPA
    config.generators do |g|
      g.test_framework :rspec
      g.fixture_replacement :factory_bot, dir: "spec/factories"
    end
  end
end
