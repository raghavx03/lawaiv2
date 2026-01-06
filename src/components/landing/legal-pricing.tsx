'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Check, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'

const plans = [
  {
    name: 'Free Trial',
    price: '₹0',
    period: 'for 7 days',
    description: 'Try all features free',
    features: [
      'All features unlocked',
      '7-day free trial',
      'No credit card required',
      'Full AI access'
    ],
    cta: 'Start Free Trial',
    popular: false,
    planType: 'FREE',
    amount: 0
  },
  {
    name: 'Plus',
    price: '₹999',
    period: '/month',
    description: 'For growing practices',
    features: [
      'Unlimited AI queries',
      'Document Generator',
      'Judgment Summarizer',
      'CRM System',
      'Legal News',
      'Priority support'
    ],
    cta: 'Get Plus',
    popular: true,
    planType: 'PLUS',
    amount: 999
  },
  {
    name: 'Pro',
    price: '₹1,499',
    period: '/month',
    description: 'Complete legal toolkit',
    features: [
      'Everything in Plus',
      'Case Tracker',
      'Legal Notices',
      'Advanced Research',
      'Acts Explorer',
      'Custom integrations'
    ],
    cta: 'Get Pro',
    popular: false,
    planType: 'PRO',
    amount: 1499
  }
]

export function LegalPricing() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    // For free trial, just redirect to signup/dashboard
    if (plan.planType === 'FREE') {
      if (!user) {
        router.push('/auth/signup')
      } else {
        router.push('/dashboard')
      }
      return
    }

    // For paid plans, need to be logged in
    if (!user) {
      router.push(`/auth/signup?redirect=/dashboard&plan=${plan.planType}`)
      return
    }

    // Already on this plan
    if (profile?.plan === plan.planType) {
      toast.success(`You're already on the ${plan.name} plan!`)
      router.push('/dashboard')
      return
    }

    setLoading(plan.planType)

    try {
      toast.loading('Preparing payment...', { id: 'payment' })
      
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planType: plan.planType,
          amount: plan.amount
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      toast.dismiss('payment')

      // Load Razorpay script if not loaded
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay'))
          document.body.appendChild(script)
        })
      }

      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        name: 'LAW.AI',
        description: `${plan.name} Plan - Monthly Subscription`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            toast.loading('Verifying payment...', { id: 'verify' })
            
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType: plan.planType,
                userId: user.id
              })
            })

            const verifyData = await verifyResponse.json()
            
            toast.dismiss('verify')
            
            if (verifyResponse.ok) {
              toast.success(`Successfully upgraded to ${plan.name}!`)
              router.push('/dashboard')
              window.location.reload()
            } else {
              throw new Error(verifyData.error || 'Payment verification failed')
            }
          } catch (error) {
            toast.dismiss('verify')
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          email: user.email || '',
          name: profile?.fullName || ''
        },
        theme: {
          color: '#111827'
        },
        modal: {
          ondismiss: function() {
            setLoading(null)
            toast.error('Payment cancelled')
          }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
      
    } catch (error: any) {
      toast.dismiss('payment')
      toast.error(error.message || 'Failed to initiate payment')
      setLoading(null)
    }
  }

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-gray-600 text-sm font-medium mb-6">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-5 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Start with a 7-day free trial. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = profile?.plan === plan.planType
            const isLoading = loading === plan.planType
            
            return (
              <div
                key={plan.name}
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 rounded-full shadow-lg">
                      <Sparkles size={14} className="text-white" />
                      <span className="text-white text-sm font-medium">Most Popular</span>
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4 z-10">
                    <div className="px-3 py-1.5 bg-green-500 rounded-full shadow-md">
                      <span className="text-white text-xs font-medium">Current Plan</span>
                    </div>
                  </div>
                )}

                <div className={`relative h-full bg-white rounded-3xl border-2 ${
                  plan.popular 
                    ? 'border-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.12)]' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]'
                } p-7 sm:p-8 transition-all duration-300`}>
                  <div className="relative">
                    {/* Plan Name */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-500 text-sm mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl sm:text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500 text-sm">{plan.period}</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={12} className="text-gray-700" />
                          </div>
                          <span className="text-gray-600 text-[15px]">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      disabled={isCurrentPlan || isLoading}
                      className={`block w-full py-4 px-6 rounded-2xl font-medium text-center transition-all duration-300 ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'
                      } disabled:opacity-50`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        plan.cta
                      )}
                    </button>

                    {plan.planType === 'FREE' && !isCurrentPlan && (
                      <p className="text-center text-xs text-gray-500 mt-4">
                        No credit card required
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Secure payments powered by</p>
          <div className="flex items-center justify-center gap-6">
            <span className="text-gray-400 font-medium">Razorpay</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400 text-sm">256-bit SSL Encryption</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400 text-sm">Cancel Anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}
