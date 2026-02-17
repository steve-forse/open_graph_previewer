class FetchOpenGraphData < ApplicationInteraction
  string :url

  HEADERS = {
    "User-Agent" => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " \
                    "(KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Accept" => "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language" => "en-US,en;q=0.9",
    "Accept-Encoding" => "gzip, deflate, br",
    "Upgrade-Insecure-Requests" => "1",
    "Cache-Control" => "max-age=0"
  }.freeze

  def execute
    response = fetch_page
    return unless response

    parse_og_tags(response.body)
  end

  private

  def fetch_page
    HTTParty.get(url, headers: HEADERS, timeout: 10)
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
