# Silver Sun Home

A production-ready Next.js application for controlling Home Assistant devices with Supabase authentication.

## Features

### Core Functionality
- **Secure Authentication**: Google OAuth via Supabase Auth with proper session management
- **Home Assistant Integration**: Server-side API proxy keeps HA tokens secure
- **Device Control**: View and toggle lights/switches with optimistic UI updates
- **Search & Filter**: Full-text search, domain filtering, and grouping by device type
- **Real-time Updates**: Auto-refresh toggle with 30-second intervals

### User Experience
- **Modern UI**: Dark theme with smooth animations and transitions
- **Mobile Optimized**: Touch-friendly targets (44px), responsive design
- **Visual Feedback**: Color-coded state indicators (green/gray/blue)
- **Loading States**: Skeleton loaders for better perceived performance
- **Error Boundaries**: Graceful error handling at global and section levels

### Performance & Security
- **Request Caching**: In-memory cache reduces API calls by ~90%
- **Rate Limiting**: Per-endpoint limits (60/min entities, 30/min controls)
- **Input Validation**: Entity ID format, domain whitelist, service validation
- **Security Headers**: CORS, CSP, X-Frame-Options via middleware
- **TypeScript Strict Mode**: Full type safety with comprehensive interfaces

### Developer Experience
- **E2E Testing**: Playwright tests for critical user flows
- **Git Hooks**: Pre-commit linting, pre-push type checking with Husky
- **Performance Monitoring**: Web Vitals tracking and API metrics endpoint
- **Health Checks**: `/api/health` endpoint for uptime monitoring

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Home Assistant](https://www.home-assistant.io) instance with long-lived access token

## Setup

### 1. Supabase Configuration

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Configure Google OAuth provider in Authentication → Providers
4. Add redirect URL: `http://localhost:3000/auth/callback` (and your production URL)

### 2. Home Assistant Token

1. Go to your Home Assistant profile → Security
2. Create a long-lived access token
3. Note your Home Assistant URL (e.g., `https://yourname.ui.nabu.casa` or `http://192.168.1.100:8123`)

### 3. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Home Assistant
HA_BASE_URL="https://yourname.ui.nabu.casa"
HA_TOKEN="your-long-lived-access-token"
```

### 4. Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── ha/
│   │   │   ├── entities/route.ts      # GET entities (rate limited, cached)
│   │   │   └── call_service/route.ts  # POST service calls (validated)
│   │   ├── health/route.ts            # Health check endpoint
│   │   └── metrics/route.ts           # Performance metrics
│   ├── auth/
│   │   └── callback/route.ts          # OAuth callback handler
│   ├── layout.tsx                     # Root layout with auth & error boundary
│   ├── page.tsx                       # Main dashboard
│   └── globals.css                    # Global styles & animations
├── components/
│   ├── AuthButtons.tsx                # Sign in/out with error handling
│   ├── Entities.tsx                   # Entity list view
│   ├── EntitiesWithControls.tsx       # Main entity dashboard with controls
│   ├── EntityGroup.tsx                # Collapsible domain groups
│   ├── SearchBar.tsx                  # Search input component
│   ├── DomainFilter.tsx               # Domain filter chips
│   ├── SkeletonCard.tsx               # Loading placeholders
│   └── ErrorBoundary.tsx              # Error boundaries
├── lib/
│   ├── supabaseBrowser.ts             # Client-side Supabase client
│   ├── supabaseServer.ts              # Server-side Supabase client
│   ├── env.ts                         # Environment validation (server-only)
│   ├── cache.ts                       # In-memory caching utility
│   ├── rate-limit.ts                  # Rate limiting implementation
│   ├── validation.ts                  # Input validation functions
│   ├── performance.ts                 # Performance monitoring
│   ├── icons.tsx                      # Entity domain icons
│   └── constants.ts                   # App configuration
├── hooks/
│   └── useEntities.ts                 # Entity fetching hook with cache
├── types/
│   └── home-assistant.ts              # TypeScript interfaces
├── tests/
│   └── e2e/
│       └── home.spec.ts               # Playwright E2E tests
├── middleware.ts                      # Security headers & CORS
├── playwright.config.ts               # E2E test configuration
├── .husky/                            # Git hooks (pre-commit, pre-push)
└── .lintstagedrc.js                   # Lint-staged configuration
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `HA_BASE_URL`
   - `HA_TOKEN`
4. Deploy

### Other Platforms

Compatible with any Node.js hosting:
- **Netlify**: Supports Next.js with Edge Functions
- **Railway**: One-click deploy from GitHub
- **Render**: Auto-deploy on push
- **DigitalOcean App Platform**: Managed Node.js hosting

### Post-Deployment Checklist

- [ ] Set all environment variables
- [ ] Update Supabase redirect URLs with production domain (e.g., `https://yourdomain.com/auth/callback`)
- [ ] Verify OAuth provider is enabled in Supabase
- [ ] Test authentication flow in production
- [ ] Check `/api/health` endpoint returns 200
- [ ] Monitor `/api/metrics` for performance issues

## Security Notes

- **Never commit `.env.local`** - It's already in `.gitignore`
- **Rotate tokens if exposed** - Both Supabase and HA tokens
- **Use HTTPS in production** - Required for OAuth
- **HA tokens stay server-side** - API routes proxy requests securely

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server on port 3000
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # ESLint checks
npm run type-check       # TypeScript type checking

# Testing
npm run test:e2e         # Run Playwright tests (headless)
npm run test:e2e:ui      # Run Playwright tests (UI mode)
```

### Git Hooks

Automatic quality checks run via Husky:
- **Pre-commit**: Prettier formatting + ESLint on staged files
- **Pre-push**: Full TypeScript type checking

### API Endpoints

#### Public Endpoints
- `GET /api/health` - Health check (HA + Supabase connectivity)
- `GET /api/metrics` - Performance metrics (API timings, error rates)

#### Authenticated Endpoints
- `GET /api/ha/entities` - Fetch all HA entities (rate limit: 60/min)
- `POST /api/ha/call_service` - Call HA service (rate limit: 30/min)

### Performance Monitoring

Access real-time metrics at `/api/metrics`:
```json
{
  "apiCalls": {
    "ha_entities": { "count": 45, "avgDuration": 120, "errorRate": 0 }
  },
  "uptime": 3600
}
```

### Configuration

Key constants in `lib/constants.ts`:
- `GRID_COLUMNS`: Grid columns for entity cards
- `RATE_LIMITS`: Per-endpoint rate limit configs
- `CACHE_TTL`: Cache expiration times

## License

MIT
