import { NextResponse } from 'next/server'

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      supabase: 'unknown',
      openai: 'unknown'
    },
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  }

  try {
    // Check database connection
    try {
      const { isDbConnected } = await import('@/lib/prisma')
      healthCheck.services.database = isDbConnected() ? 'healthy' : 'unhealthy'
    } catch {
      healthCheck.services.database = 'unhealthy'
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