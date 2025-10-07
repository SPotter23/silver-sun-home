/**
 * Application constants
 */

// UI Layout
export const GRID_COLUMNS = 3 // Number of columns in entity grid on medium+ screens
export const MAX_CONTENT_WIDTH = '6xl' // max-w-{value} for main content

// Server
export const DEV_PORT = 3000
export const PROD_PORT = 3000

// Entity refresh (future use)
export const ENTITY_REFRESH_INTERVAL = 30000 // 30 seconds
export const ENTITY_STALE_TIME = 10000 // 10 seconds

// API timeouts
export const HA_API_TIMEOUT = 10000 // 10 seconds
export const SUPABASE_TIMEOUT = 5000 // 5 seconds

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 60 // 60 requests per minute
export const RATE_LIMIT_MAX_SERVICE_CALLS = 30 // 30 service calls per minute
