'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Crown, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

interface SimpleUpgradeModalProps {
  open: boolean
  onClose: () => void
}

const plans = [
  { name: 'BASIC', price: 499, features: ['3 Core Features', 'Unlimited Queries'] },
  { name: 'PLUS', price: 999, features: ['6 Features', 'Priority Support'] },
  { name: 'PRO', price: 1499, features: ['All 9 Features', '24/7 Support'] }
]

export function SimpleUpgradeModal({ open, onClose }: SimpleUpgradeModalProps) {
  const { user, refreshProfile } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planType: string, amount: number) => {
    setLoading(planType)
    
    try {
      console.log('🚀 Starting payment for:', planType, amount)
      console.log('🌐 Current URL:', window.location.href)
      
      // Direct API call without CSRF
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, amount })
      })

      console.log('📡 API Response Status:', response.status)
      console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        console.error('❌ API Error Status:', response.status)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const orderData = await response.json()
      console.log('📋 Order Data Received:', orderData)
      console.log('🔑 Razorpay Key ID:', orderData.keyId)

      // Validate order data
      if (!orderData.orderId || !orderData.keyId) {
        console.error('❌ Invalid order data:', orderData)
        throw new Error('Invalid order data received')
      }

      // Load Razorpay and open payment with mobile optimization
      if (typeof window.Razorpay === 'undefined') {
        console.log('📥 Loading Razorpay script...')
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => {
          console.log('✅ Razorpay script loaded successfully')
          // Add mobile body class for CSS fixes
          if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            document.body.classList.add('razorpay-mobile')
          }
          setTimeout(() => openRazorpay(orderData, planType), 100)
        }
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay script')
          toast.error('Failed to load payment gateway')
          setLoading(null)
        }
        document.head.appendChild(script)
      } else {
        console.log('✅ Razorpay already available')
        // Add mobile body class for CSS fixes
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          document.body.classList.add('razorpay-mobile')
        }
        setTimeout(() => openRazorpay(orderData, planType), 100)
      }

    } catch (error) {
      console.error('💥 Payment Error Details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      toast.error('Payment failed: ' + error.message)
      setLoading(null)
    }
  }

  const openRazorpay = (orderData: any, planType: string) => {
    console.log('💳 Opening Razorpay with options:')
    console.log('💳 Order ID:', orderData.orderId)
    console.log('💳 Amount:', orderData.amount)
    console.log('💳 Key ID:', orderData.keyId)
    
    // Check if Razorpay is available
    if (typeof window.Razorpay === 'undefined') {
      console.error('❌ Razorpay not loaded!')
      toast.error('Payment gateway not loaded')
      setLoading(null)
      return
    }
    
    // Enhanced mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    window.innerWidth <= 768 || 
                    ('ontouchstart' in window) || 
                    (navigator.maxTouchPoints > 0)
    
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'LAW-AI',
      description: `Upgrade to ${planType} Plan`,
      order_id: orderData.orderId,
      handler: async function (response: any) {
        console.log('✅ Payment Success:', response)
        
        try {
          // Verify payment
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType
            })
          })

          if (verifyResponse.ok) {
            const result = await verifyResponse.json()
            toast.success(result.message)
            await refreshProfile()
            onClose()
          } else {
            toast.error('Payment verification failed')
          }
        } catch (error) {
          console.error('Verification error:', error)
          toast.error('Payment verification failed')
        }
        
        setLoading(null)
      },
      prefill: {
        name: user?.user_metadata?.full_name || 'User',
        email: user?.email || '',
        contact: ''
      },
      theme: { 
        color: '#3B82F6',
        backdrop_color: 'rgba(0, 0, 0, 0.6)'
      },
      modal: {
        backdropclose: false,
        escape: true,
        handleback: true,
        confirm_close: false,
        ondismiss: function() {
          console.log('Payment dismissed')
          setLoading(null)
        },
        animation: true
      },
      // Mobile-specific optimizations
      ...(isMobile && {
        display: {
          blocks: {
            utib: {
              name: 'Pay with UPI',
              instruments: [
                { method: 'upi' }
              ]
            },
            banks: {
              name: 'Net Banking',
              instruments: [
                { method: 'netbanking' }
              ]
            },
            cards: {
              name: 'Cards',
              instruments: [
                { method: 'card' }
              ]
            },
            wallets: {
              name: 'Wallets',
              instruments: [
                { method: 'wallet' }
              ]
            }
          },
          sequence: ['block.utib', 'block.cards', 'block.banks', 'block.wallets'],
          preferences: {
            show_default_blocks: true
          }
        },
        config: {
          display: {
            language: 'en'
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      })
    }

    try {
      console.log('🎯 Creating Razorpay instance...')
      
      // Add mobile-specific event listeners
      if (isMobile) {
        // Prevent body scroll when payment opens
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        
        // Restore on payment close
        const originalDismiss = options.modal.ondismiss
        options.modal.ondismiss = function() {
          document.body.style.overflow = originalOverflow
          document.body.classList.remove('razorpay-mobile')
          if (originalDismiss) originalDismiss()
        }
      }
      
      // @ts-ignore
      const rzp = new window.Razorpay(options)
      console.log('🎯 Razorpay instance created, opening checkout...')
      rzp.open()
      console.log('✅ Razorpay checkout opened')
    } catch (razorpayError) {
      console.error('❌ Razorpay Error:', razorpayError)
      toast.error('Failed to open payment gateway')
      setLoading(null)
      // Restore body scroll on error
      if (isMobile) {
        document.body.style.overflow = 'auto'
        document.body.classList.remove('razorpay-mobile')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[700px] overflow-hidden flex flex-col p-0 m-2">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-center text-lg md:text-xl font-bold">Upgrade Your Plan</DialogTitle>
          <p className="text-center text-gray-600 text-sm">Choose the perfect plan for your needs</p>
        </DialogHeader>

        <button onClick={onClose} className="absolute right-2 top-2 md:right-4 md:top-4 p-2 rounded-sm opacity-70 hover:opacity-100 z-10">
          <X className="h-4 w-4" />
        </button>

        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className="relative h-full flex flex-col">
                <CardHeader className="text-center pb-3">
                  <Crown className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-blue-600" />
                  <CardTitle className="text-base md:text-lg">{plan.name}</CardTitle>
                  <div className="text-xl md:text-2xl font-bold">
                    ₹{plan.price}
                    <span className="text-xs md:text-sm font-normal text-gray-500">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-1 md:space-y-2 mb-4 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-xs md:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleUpgrade(plan.name, plan.price)}
                    disabled={loading === plan.name}
                    className="w-full text-sm md:text-base py-2 md:py-3"
                  >
                    {loading === plan.name ? 'Processing...' : `Upgrade - ₹${plan.price}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-500">
            <p>✓ Secure payments • ✓ Cancel anytime • ✓ 30-day guarantee</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}