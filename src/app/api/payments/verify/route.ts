import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Payment verification called')

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
      userId
    } = await request.json()

    console.log('📋 Verification data:', { razorpay_order_id, razorpay_payment_id, planType, userId })

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planType) {
      return NextResponse.json(
        { error: 'Missing required payment data' },
        { status: 400 }
      )
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Invalid signature')
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    console.log('✅ Payment signature verified')

    // Get user from Supabase session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value }) => {
                cookieStore.set(name, value)
              })
            } catch (e) {
              // Read-only ignore
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Update user plan in database
    try {
      const { safeDbOperation } = await import('@/lib/prisma')

      await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) throw new Error('Database unavailable')

        // Calculate plan expiry (30 days from now)
        const planExpiry = new Date()
        planExpiry.setDate(planExpiry.getDate() + 30)

        // Update user plan
        const updatedUser = await prisma.userApp.upsert({
          where: { userId: user.id },
          update: {
            plan: planType,
            planExpiry: planExpiry,
            paymentId: razorpay_payment_id,
            updatedAt: new Date()
          },
          create: {
            userId: user.id,
            email: user.email!,
            plan: planType,
            planExpiry: planExpiry,
            paymentId: razorpay_payment_id,
            usageCount: 0
          }
        })

        console.log('✅ User plan updated:', updatedUser.plan)
        return updatedUser
      }, null)

    } catch (dbError) {
      console.error('❌ Database update error:', dbError)
      // Continue anyway - payment was successful
    }

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${planType} plan!`,
      plan: planType,
      paymentId: razorpay_payment_id
    })

  } catch (error) {
    console.error('❌ Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed: ' + (error as Error).message },
      { status: 500 }
    )
  }
}