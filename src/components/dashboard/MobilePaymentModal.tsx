'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Zap, Star, X, Smartphone } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

interface MobilePaymentModalProps {
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

export function MobilePaymentModal({ open, onClose }: MobilePaymentModalProps) {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planType: string, amount: number) => {
    if (!user) {
      toast.error('Please login to upgrade')
      return
    }

    setLoading(planType)

    try {
      // Create order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, amount })
      })

      const orderData = await orderResponse.json()
      if (!orderResponse.ok) throw new Error(orderData.error)

      // Mobile detection and optimized Razorpay options
      const isMobile = true // This is specifically for mobile
      
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LAW-AI',
        description: `Upgrade to ${planType}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType,
                userId: user.id
              })
            })

            const verifyData = await verifyResponse.json()
            if (verifyResponse.ok) {
              toast.success(`Successfully upgraded to ${planType}!`)
              await refreshProfile()
              onClose()
              window.location.reload()
            } else {
              toast.error(verifyData.error || 'Payment verification failed')
            }
          } catch (error) {
            toast.error('Payment verification failed')
          } finally {
            setLoading(null)
          }
        },
        prefill: {
          name: profile?.fullName || user.email?.split('@')[0] || '',
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
          ondismiss: () => {
            console.log('Mobile payment dismissed')
            setLoading(null)
          },
          animation: true
        },
        // Mobile-specific optimizations
        display: {
          blocks: {
            utib: {
              name: 'Pay with UPI',
              instruments: [
                { method: 'upi' }
              ]
            },
            cards: {
              name: 'Cards',
              instruments: [
                { method: 'card' }
              ]
            },
            banks: {
              name: 'Net Banking',
              instruments: [
                { method: 'netbanking' }
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
      }

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      } else {
        toast.error('Payment gateway not loaded')
        setLoading(null)
      }

    } catch (error) {
      toast.error('Failed to initiate payment')
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-sm h-[85vh] max-h-[650px] overflow-hidden flex flex-col p-0 m-2">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-lg font-bold">Upgrade Plan</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {plans.map((plan) => {
              const Icon = plan.icon
              const isCurrentPlan = profile?.plan === plan.name
              const isLoading = loading === plan.name

              return (
                <Card key={plan.name} className={`relative ${plan.popular ? 'ring-1 ring-purple-500' : ''} ${isCurrentPlan ? 'bg-green-50 border-green-200' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500 text-xs">
                      Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          plan.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          <div className="text-lg font-bold">
                            ₹{plan.price}
                            <span className="text-xs font-normal text-gray-500">/mo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <ul className="space-y-1 mb-3">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="text-xs">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleUpgrade(plan.name, plan.price)}
                      disabled={isCurrentPlan || isLoading}
                      className={`payment-button w-full text-sm ${
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

          <div className="mt-4 text-center text-xs text-gray-500 px-2">
            <p>✓ Secure payments • ✓ UPI, Cards, NetBanking</p>
            <p>✓ Cancel anytime • ✓ 30-day guarantee</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}