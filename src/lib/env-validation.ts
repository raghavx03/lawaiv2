/**
 * Environment variable validation
 * This ensures all required environment variables are present and valid
 */

interface RequiredEnvVars {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  OPENAI_API_KEY: string
  DATABASE_URL: string
  NEXT_PUBLIC_SITE_URL: string
  NODE_ENV: string
}

interface OptionalEnvVars {
  RAZORPAY_KEY_SECRET?: string
  RAZORPAY_WEBHOOK_SECRET?: string
  NEXT_PUBLIC_RAZORPAY_KEY_ID?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  ADMIN_EMAILS?: string
}

/**
 * Validate required environment variables
 */
export function validateEnvVars(): RequiredEnvVars & OptionalEnvVars {
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'DATABASE_URL',
    'NEXT_PUBLIC_SITE_URL',
    'NODE_ENV'
  ]

  const missing: string[] = []
  const envVars: any = {}
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL

  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (!value || value.trim() === '' || value.includes('your_')) {
      if (!isBuildTime) {
        console.warn(`⚠️  ${varName} is missing or placeholder - using fallback`)
      }
      // Use placeholder during build or when missing
      envVars[varName] = varName === 'NEXT_PUBLIC_SUPABASE_URL' ? 'https://placeholder.supabase.co' :
                        varName === 'NEXT_PUBLIC_SITE_URL' ? 'http://localhost:3000' :
                        'placeholder_value'
    } else {
      envVars[varName] = value.trim()
    }
  }

  // Check optional variables
  const optionalVars: (keyof OptionalEnvVars)[] = [
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
    'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'ADMIN_EMAILS'
  ]

  for (const varName of optionalVars) {
    const value = process.env[varName]
    if (value && value.trim() !== '' && !value.includes('your_')) {
      envVars[varName] = value.trim()
    }
  }

  // Validate NODE_ENV
  if (!['development', 'production', 'test'].includes(envVars.NODE_ENV)) {
    envVars.NODE_ENV = 'development' // Default fallback
  }

  return envVars
}

/**
 * Get validated environment variables
 */
export const env = validateEnvVars()

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Get admin emails list
 */
export const adminEmails = env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []

/**
 * Check if payments are enabled
 */
export const paymentsEnabled = !!(env.RAZORPAY_KEY_SECRET && env.NEXT_PUBLIC_RAZORPAY_KEY_ID)

/**
 * Check if Google OAuth is enabled
 */
export const googleOAuthEnabled = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)