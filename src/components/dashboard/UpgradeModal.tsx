'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Zap, Star, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

const plans = [
  {
    name: 'BASIC',
    price: 499,
    features: ['3 Core Features', 'Unlimited Queries', 'Email Support'],
    icon: Zap,
    color: 'blue'
  },
  {
    name: 'PLUS',
    price: 999,
    features: ['6 Features', 'Unlimited Queries', 'Priority Support', 'Advanced AI'],
    icon: Star,
    color: 'purple',
    popular: true
  },
  {
    name: 'PRO',
    price: 1499,
    features: ['All 9 Features', 'Unlimited Queries', '24/7 Support', 'Premium AI', 'API Access'],
    icon: Crown,
    color: 'gold'
  }
]

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.head.appendChild(script)
    })
  }

  const handleUpgrade = async (planType: string, amount: number) => {
    if (!user) {
      toast.error('Please login to upgrade')
      return
    }

    setLoading(planType)
    console.log('🚀 Starting payment for:', planType, amount)

    try {
      // Load Razorpay script first
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script')
      }

      // Create Razorpay order
      console.log('📦 Creating order...')
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planType,
          amount
        })
      })

      const orderData = await orderResponse.json()
      console.log('📋 Order response:', orderData)

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order')
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
          console.log('💳 Payment successful:', response)
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType,
                userId: user.id
              })
            })

            const verifyData = await verifyResponse.json()
            console.log('✅ Verification response:', verifyData)

            if (verifyResponse.ok) {
              toast.success(verifyData.message || `Successfully upgraded to ${planType}!`)
              await refreshProfile()
              onClose()
              // Refresh page to update UI
              window.location.reload()
            } else {
              toast.error(verifyData.error || 'Payment verification failed')
            }
          } catch (error) {
            console.error('❌ Payment verification error:', error)
            toast.error('Payment verification failed')
          } finally {
            setLoading(null)
          }
        },
        prefill: {
          name: profile?.fullName || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          contact: profile?.phone || ''
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
            console.log('💸 Payment cancelled by user')
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

      console.log('🎯 Opening Razorpay checkout...')
      const rzp = new (window as any).Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error('❌ Payment error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment')
      setLoading(null)
    }
  }

  return (
    <>
      
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-5xl h-[90vh] max-h-[750px] overflow-hidden flex flex-col p-0 m-2">
          <DialogHeader className="p-3 md:p-4 pb-2 border-b">
            <DialogTitle className="text-center text-lg md:text-xl font-bold">
              Upgrade Your Plan
            </DialogTitle>
            <p className="text-center text-gray-600 text-xs md:text-sm">
              Choose the perfect plan for your legal practice
            </p>
          </DialogHeader>

          <button
            onClick={onClose}
            className="absolute right-2 top-2 md:right-4 md:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10 p-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex-1 overflow-y-auto px-2 md:px-4 pb-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              {plans.map((plan) => {
                const Icon = plan.icon
                const isCurrentPlan = profile?.plan === plan.name
                const isLoading = loading === plan.name

                return (
                  <Card 
                    key={plan.name}
                    className={`relative ${plan.popular ? 'ring-2 ring-purple-500 sm:scale-105' : ''} ${isCurrentPlan ? 'bg-green-50 border-green-200' : ''} h-full flex flex-col`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500 text-xs">
                        Most Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center pb-2 px-3">
                      <div className={`mx-auto p-2 rounded-full w-fit ${
                        plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        plan.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        <Icon className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <CardTitle className="text-base md:text-lg">{plan.name}</CardTitle>
                      <div className="text-xl md:text-2xl font-bold">
                        ₹{plan.price}
                        <span className="text-xs font-normal text-gray-500">/mo</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2 md:space-y-3 flex-1 flex flex-col px-3">
                      <ul className="space-y-1 flex-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                            <span className="text-xs">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handleUpgrade(plan.name, plan.price)}
                        disabled={isCurrentPlan || isLoading}
                        className={`w-full text-xs md:text-sm py-2 ${
                          isCurrentPlan ? 'bg-green-500' :
                          plan.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                          plan.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                          'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                      >
                        {isCurrentPlan ? 'Current Plan' : 
                         isLoading ? 'Processing...' : 
                         `Upgrade - ₹${plan.price}`}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-3 md:mt-4 text-center text-xs text-gray-500 px-2">
              <p>✓ Secure payments • ✓ Cancel anytime • ✓ 30-day guarantee</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}