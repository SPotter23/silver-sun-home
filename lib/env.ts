/**
 * Environment variable validation (SERVER-SIDE ONLY)
 * Validates required environment variables at startup
 *
 * WARNING: This file should only be imported by server-side code.
 * Client components should use process.env.NEXT_PUBLIC_* directly.
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string

  // Home Assistant (SERVER-ONLY)
  HA_BASE_URL: string
  HA_TOKEN: string
}

function validateEnv(): EnvConfig {
  const errors: string[] = []

  // Validate Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must start with https://')
  }

  // Validate Supabase anon key
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }

  // Validate HA base URL
  const haBaseUrl = process.env.HA_BASE_URL
  if (!haBaseUrl) {
    errors.push('HA_BASE_URL is required')
  } else if (!haBaseUrl.startsWith('http://') && !haBaseUrl.startsWith('https://')) {
    errors.push('HA_BASE_URL must start with http:// or https://')
  }

  // Validate HA token
  const haToken = process.env.HA_TOKEN
  if (!haToken) {
    errors.push('HA_TOKEN is required')
  }

  if (errors.length > 0) {
    // During build time, just log warnings instead of throwing
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('⚠️  Environment variables not set (will be required at runtime):')
      errors.forEach(e => console.warn(`   - ${e}`))
      // Return empty config for build time
      return {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey || '',
        HA_BASE_URL: haBaseUrl || '',
        HA_TOKEN: haToken || '',
      }
    }

    // At runtime, throw error
    throw new Error(
      `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}\n\n` +
      `Please check your .env.local file and ensure all required variables are set.`
    )
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey!,
    HA_BASE_URL: haBaseUrl!,
    HA_TOKEN: haToken!,
  }
}

// Validate and export config
export const env = validateEnv()
