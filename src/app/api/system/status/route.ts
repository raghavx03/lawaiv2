import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/prisma'

export async function GET() {
  const timestamp = new Date().toISOString()
  
  try {
    // System checks
    const checks = {
      database: await testConnection(),
      environment: {
        supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        openai: !!process.env.OPENAI_API_KEY,
        razorpay: !!(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
        stripe: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
        email: !!process.env.RESEND_API_KEY
      }
    }

    const overallStatus = checks.database && 
      Object.values(checks.environment).some(Boolean) ? 'operational' : 'degraded'

    return NextResponse.json({
      status: overallStatus,
      timestamp,
      checks,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp,
      error: error instanceof Error ? error.message : 'System check failed'
    }, { status: 500 })
  }
}