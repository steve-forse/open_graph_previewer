class FetchOpenGraphData < ApplicationInteraction
  string :url

  USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " \
               "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

  def execute
    response = fetch_page
    return unless response

    parse_og_tags(response.body)
  end

  private

  def fetch_page
    HTTParty.get(url, headers: { "User-Agent" => USER_AGENT }, timeout: 10)
  rescue HTTParty::Error, Net::OpenTimeout, Net::ReadTimeout, SocketError, Errno::ECONNREFUSED => e
    errors.add(:base, "HTTP request failed: #{e.message}")
    nil
  end

  def parse_og_tags(html)
    doc = Nokogiri::HTML(html)
    og_tags = {}

    doc.css('meta[property]').each do |meta|
      property = meta["property"].to_s
      content = meta["content"].to_s

      og_tags[property] = content if property.downcase.start_with?("og:")
    end

    og_tags
  end
end
