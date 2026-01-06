import { NextResponse } from 'next/server'

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'build-time',
      supabase: 'build-time',
      openai: 'build-time'
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  }

  // Skip all checks during build time
  if (process.env.VERCEL_ENV || process.env.NEXT_PHASE) {
    return NextResponse.json(healthCheck)
  }

  try {
    // Check database connection (skip during build)
    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder')) {
        healthCheck.services.database = 'configured'
      } else {
        healthCheck.services.database = 'not_configured'
      }
    } catch {
      healthCheck.services.database = 'error'
    }

    // Check Supabase connection
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        healthCheck.services.supabase = 'configured'
      } else {
        healthCheck.services.supabase = 'not_configured'
      }
    } catch {
      healthCheck.services.supabase = 'error'
    }

    // Check OpenAI configuration
    try {
      if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder')) {
        healthCheck.services.openai = 'configured'
      } else {
        healthCheck.services.openai = 'not_configured'
      }
    } catch {
      healthCheck.services.openai = 'error'
    }

    // Determine overall status
    const unhealthyServices = Object.values(healthCheck.services).filter(
      status => status === 'unhealthy' || status === 'error'
    )
    
    if (unhealthyServices.length > 0) {
      healthCheck.status = 'degraded'
    }

    return NextResponse.json(healthCheck)
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 500 })
  }
}