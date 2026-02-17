# OpenGraphPreviewer

A Rails 8 web application that lets users submit any URL, asynchronously fetches all Open Graph `<meta>` tags from the page, stores them as structured JSON, and displays the `og:image` alongside the URL. A full history of all submitted URLs (newest first) is shown on the same page.

## Architecture

### Layer Structure

```
Controllers → Jobs → Interactions (service objects) → Models
```

- **Controllers** are thin — validate params, enqueue jobs, return JSON
- **Jobs** (ActiveJob + solid_queue) orchestrate workflow by calling interactions
- **Interactions** (ActiveInteraction) contain all business logic
- **Models** are thin — validations, associations, scopes only

### Key Design Decisions

**ActionCable WebSockets**: The React frontend subscribes to an `OpenGraphPreviewsChannel` via ActionCable for real-time updates. When a background job finishes fetching OG data, the result is broadcast to all connected clients immediately.

**solid_queue + solid_cable**: Both are included in Rails 8 by default. No need for Redis or external dependencies — they use the SQLite database directly. Perfect for this application's scope.

**ActiveInteraction**: Provides a clean service object pattern with typed inputs, composability, and built-in error handling. Keeps controllers and models thin per SOLID principles.

**JSONB og_data column**: Stores the full set of Open Graph properties as a hash. This preserves all data (not just og:image) for debugging and future features. The `og_image_url` column is extracted separately for convenient display queries.

## Tech Stack

### Backend
- Ruby on Rails 8.1 with SQLite
- solid_queue for background jobs
- ActiveInteraction for service objects
- Nokogiri + HTTParty for HTML fetching/parsing

### Frontend
- Vite + vite-ruby with HMR
- React 18 with TypeScript
- Mantine UI component library (dark theme)
- Tabler Icons
- Axios for API calls
- ActionCable for real-time WebSocket updates

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd open_graph_preview

# Install Ruby dependencies
bundle install

# Install JavaScript dependencies
npm install

# Create and migrate the database
bin/rails db:create db:migrate

# Start all services (web, worker, vite)
bin/dev
# Or use foreman/overmind with:
# foreman start -f Procfile.dev
```

The app will be available at http://localhost:3000

## Running Tests

```bash
# Backend
bundle exec rspec

# Frontend
npm run test:run
```

## Security Scan

```bash
bundle exec brakeman
```

## Linting

```bash
bundle exec rubocop
```

## Development Notes

- AI was used to scaffold and assist development of this application
- Real-time updates are delivered via ActionCable — see `useOpenGraphPreviews.ts`
- The HTTP fetcher uses a 10-second timeout and realistic User-Agent header
- All OG tag extraction is case-insensitive on the property attribute

## Known Limitations

- **No rate limiting**: URL submissions are not rate-limited
- **No authentication**: The app is open to all users
- **No pagination**: All previews are loaded at once; would need pagination at scale
- **Single-threaded SQLite**: Not suitable for high-concurrency production deployments
- **No CDN/proxy for og:images**: Images are loaded directly from source URLs
- **No retry mechanism**: Failed fetches are not automatically retried
