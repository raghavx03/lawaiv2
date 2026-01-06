import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Payment API called')
    
    // Check if keys are available
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    
    console.log('🔑 Keys check:', { 
      keyId: keyId ? 'Available' : 'Missing',
      keySecret: keySecret ? 'Available' : 'Missing'
    })
    
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay keys not configured' },
        { status: 500 }
      )
    }
    
    const { planType, amount } = await request.json()
    console.log('📋 Request data:', { planType, amount })

    if (!planType || !amount) {
      return NextResponse.json(
        { error: 'Plan type and amount are required' },
        { status: 400 }
      )
    }

    // Initialize Razorpay with keys
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        planType,
        timestamp: new Date().toISOString()
      }
    })

    console.log('✅ Order created:', order.id)

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId
    })

  } catch (error: any) {
    console.error('❌ Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    )
  }
}