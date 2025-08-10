# Reality Scraper

A NextJS application for managing realities with web scraping capabilities.

## Features

- **Web Scraping**: Manual scraping of websites using Puppeteer
- **Database Management**: Prisma-based database with PostgreSQL
- **Real-time Updates**: SWR for data fetching and caching
- **Modern UI**: Ant Design components with responsive design

## Web Scraping

The application includes a web scraping API that can scrape the `.introduction` selector from `https://www.miroslavkrnac.cz/`.

### How it works

1. **Manual Trigger**: Scraping is triggered via API endpoint
2. **Web Scraping**: Uses Puppeteer to scrape the target website
3. **Logging**: All scraping activities are logged to the console

### API Endpoints

- `POST /api/scrape` - Manually trigger scraping

#### Example API Usage

```bash
# Trigger scraping
curl -X POST http://localhost:3000/api/scrape
```

### Configuration

The scraping configuration can be found in:
- `src/app/api/scrape/route.ts` - Scraping API endpoint
- `src/scraper/scraper.utils.ts` - Puppeteer utilities

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Yarn package manager
- Docker (for PostgreSQL)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up the database:
   ```bash
   yarn db:up
   yarn db:push
   yarn db:seed
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

The application will be available at `http://localhost:3000`.

### Development

- **Linting**: `yarn lint` or `yarn lint:fix`
- **Testing**: `yarn test`
- **Database**: `yarn db:studio` (Prisma Studio)

## Project Structure

```
src/
├── app/                 # Next.js app router
│   └── api/            # API endpoints
│       └── scrape/     # Scraping API
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── scraper/            # Web scraping utilities
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Technologies Used

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Ant Design, SCSS
- **Database**: PostgreSQL, Prisma
- **Testing**: Vitest, React Testing Library
- **Linting**: Biome
- **Web Scraping**: Puppeteer
