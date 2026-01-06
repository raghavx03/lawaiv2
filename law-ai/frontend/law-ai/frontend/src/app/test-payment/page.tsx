'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  const testCreateOrder = async () => {
    setLoading(true)
    try {
      console.log('🧪 Testing order creation...')
      
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planType: 'BASIC',
          amount: 499
        })
      })

      const data = await response.json()
      console.log('📋 Order response:', data)
      
      if (response.ok) {
        setOrderData(data)
        toast.success('Order created successfully!')
      } else {
        toast.error(data.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const testRazorpayPayment = async () => {
    if (!orderData) {
      toast.error('Create order first')
      return
    }

    try {
      console.log('🚀 Testing Razorpay payment...')
      
      // Check if Razorpay is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        toast.error('Razorpay script not loaded')
        return
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LAW-AI Test',
        description: 'Test Payment',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          console.log('✅ Payment successful:', response)
          toast.success('Payment successful!')
          
          // Test verification
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType: 'BASIC'
              })
            })

            const verifyData = await verifyResponse.json()
            console.log('🔍 Verification response:', verifyData)
            
            if (verifyResponse.ok) {
              toast.success('Payment verified!')
            } else {
              toast.error('Verification failed')
            }
          } catch (error) {
            console.error('Verification error:', error)
            toast.error('Verification error')
          }
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            console.log('💸 Payment cancelled')
            toast.error('Payment cancelled')
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error('❌ Payment error:', error)
      toast.error('Payment failed')
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Razorpay Payment Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Environment Check:</h3>
              <div className="text-sm space-y-1">
                <div>Key ID: {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing'}</div>
                <div>Razorpay Script: {typeof window !== 'undefined' && (window as any).Razorpay ? '✅ Loaded' : '❌ Not Loaded'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={testCreateOrder} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating...' : '1. Test Create Order'}
              </Button>
              
              {orderData && (
                <div className="p-3 bg-green-50 rounded text-sm">
                  <div>✅ Order ID: {orderData.orderId}</div>
                  <div>💰 Amount: ₹{orderData.amount / 100}</div>
                </div>
              )}
            </div>

            <Button 
              onClick={testRazorpayPayment} 
              disabled={!orderData}
              className="w-full"
              variant="outline"
            >
              2. Test Razorpay Payment
            </Button>

            <div className="text-xs text-gray-500 space-y-1">
              <div>• Use test card: 4111 1111 1111 1111</div>
              <div>• CVV: Any 3 digits</div>
              <div>• Expiry: Any future date</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify({
                razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                razorpayLoaded: typeof window !== 'undefined' ? !!(window as any).Razorpay : 'unknown',
                orderData: orderData
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}