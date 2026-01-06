import { NextResponse } from 'next/server'

export async function GET() {
  const startTime = Date.now()
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      services: {
        database: 'unknown',
        supabase: 'unknown',
        openai: 'unknown',
        razorpay: 'unknown'
      },
      performance: {
        responseTime: 0
      }
    }

    // Test database
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.$queryRaw`SELECT 1`
      health.services.database = 'connected'
    } catch (e) {
      health.services.database = 'disconnected'
      health.status = 'degraded'
    }

    // Check service configurations
    health.services.supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing'
    health.services.openai = process.env.OPENAI_API_KEY ? 'configured' : 'missing'
    health.services.razorpay = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'configured' : 'missing'

    // Performance metrics
    health.performance.responseTime = Date.now() - startTime

    const statusCode = health.status === 'healthy' ? 200 : 503
    return NextResponse.json(health, { status: statusCode })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 500 })
  }
}