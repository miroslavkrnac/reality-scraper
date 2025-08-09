# Reality Scraper

A NextJS application for managing realities with a modern tech stack.

## Tech Stack

- **NextJS 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Vitest** - Fast unit testing framework
- **Ant Design** - Modern React UI component library
- **SCSS Modules** - Modular styling
- **Prisma ORM** - Database ORM for MySQL
- **Biome** - Fast linter and formatter
- **Knip** - Dead code elimination

## Features

- 🏠 **Homepage** - Landing page with welcome message
- 📊 **Realities Table** - Server-side rendered table displaying realities data
- 🎨 **Modern Design** - Clean UI following best practices
- 🚀 **Server-Side Rendering** - All pages are SSR for optimal performance
- 📱 **Responsive Design** - Works on all device sizes

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- MySQL database (for production use)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd reality-scraper
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your database connection string
   ```

4. Generate Prisma client:
   ```bash
   yarn db:generate
   ```

5. Run database migrations (if using a real database):
   ```bash
   yarn db:migrate
   ```

### Development

```bash
# Start development server
yarn dev

# Run linting
yarn lint

# Fix linting issues
yarn lint:fix

# Run tests
yarn test

# Run tests in watch mode
yarn test:watch
```

### Database Commands

```bash
# Push schema changes to database
yarn db:push

# Generate Prisma client
yarn db:generate

# Run migrations
yarn db:migrate

# Open Prisma Studio
yarn db:studio
```

### Building for Production

```bash
# Build the application
yarn build

# Start production server
yarn start
```

## Project Structure

```
src/
├── app/                    # NextJS App Router pages
│   ├── api/               # API routes
│   ├── realities/         # Realities page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.scss       # Global styles
├── components/            # Reusable components
│   └── Navigation/        # Navigation component
├── lib/                   # Utilities and configurations
│   └── db.ts             # Prisma client setup
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── test/                  # Test setup files
```

## API Endpoints

### GET /api/realities

Returns a list of fake realities data.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Reality One"
  },
  {
    "id": 2,
    "name": "Reality Two"
  }
]
```

## Pages

### Homepage (`/`)
- Displays a welcome message
- Clean, centered design
- Links to other sections

### Realities Table (`/realities`)
- Server-side rendered table
- Displays data from `/api/realities`
- Sortable columns
- Pagination support
- Responsive design

## Code Quality

This project follows strict code quality standards:

- **Biome** for linting and formatting
- **TypeScript** for type safety
- **SCSS Modules** for scoped styling
- **Vitest** for testing
- **Knip** for dead code detection

## License

MIT License
