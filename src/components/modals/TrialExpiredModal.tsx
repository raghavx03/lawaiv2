'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import { X, Crown, Check, Sparkles } from 'lucide-react'

interface TrialExpiredModalProps {
  isOpen: boolean
  onClose?: () => void
  daysLeft?: number
}

const plans = [
  {
    name: 'Plus',
    price: 999,
    priceDisplay: '₹999',
    period: '/month',
    features: ['Unlimited AI queries', 'Document Generator', 'Judgment Summarizer', 'CRM System', 'Priority support'],
    planType: 'PLUS'
  },
  {
    name: 'Pro',
    price: 1499,
    priceDisplay: '₹1,499',
    period: '/month',
    features: ['Everything in Plus', 'Case Tracker', 'Legal Notices', 'Advanced Research', 'Custom integrations'],
    planType: 'PRO',
    popular: true
  }
]

export function TrialExpiredModal({ isOpen, onClose, daysLeft }: TrialExpiredModalProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  const isExpired = daysLeft !== undefined && daysLeft <= 0
  const isExpiringSoon = daysLeft !== undefined && daysLeft > 0 && daysLeft <= 3

  const handleUpgrade = async (plan: typeof plans[0]) => {
    if (!user) {
      router.push('/auth/login')
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
          amount: plan.price
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
          ondismiss: function () {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isExpired ? 'Your Free Trial Has Ended' : 'Upgrade Your Plan'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isExpired
                    ? 'Upgrade now to continue using all features'
                    : isExpiringSoon
                    ? `Only ${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your trial`
                    : 'Get unlimited access to all features'}
                </p>
              </div>
            </div>
            {onClose && !isExpired && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.planType}
                className={`relative rounded-2xl border-2 p-5 transition-all ${
                  plan.popular
                    ? 'border-gray-900 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
                      <Sparkles className="h-3 w-3" />
                      Recommended
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.priceDisplay}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Check className="h-2.5 w-2.5 text-gray-700" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={loading !== null}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? 'bg-gray-900 hover:bg-gray-800 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } disabled:opacity-50`}
                >
                  {loading === plan.planType ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Secure payment powered by Razorpay • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}
