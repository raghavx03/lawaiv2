'use client'

import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PricingTable() {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        { name: '5 queries/day', included: true },
        { name: 'Basic risk scoring', included: true },
        { name: 'Red flags & warnings', included: true },
        { name: 'PDF download', included: false },
        { name: 'Email support', included: false },
        { name: 'API access', included: false },
      ],
      cta: 'Get Started',
      ctaHref: '/auth/signup',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For professionals',
      features: [
        { name: 'Unlimited queries', included: true },
        { name: 'Advanced risk scoring', included: true },
        { name: 'Red flags & warnings', included: true },
        { name: 'PDF download', included: true },
        { name: 'Email support', included: true },
        { name: 'API access', included: true },
      ],
      cta: 'Start Free Trial',
      ctaHref: '/pricing',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large teams',
      features: [
        { name: 'Unlimited queries', included: true },
        { name: 'Advanced risk scoring', included: true },
        { name: 'Red flags & warnings', included: true },
        { name: 'PDF download', included: true },
        { name: 'Dedicated support', included: true },
        { name: 'API access', included: true },
      ],
      cta: 'Contact Sales',
      ctaHref: '/pricing',
      highlighted: false,
    },
  ]

  return (
    <div className="space-y-4">
      {tiers.map((tier, idx) => (
        <div
          key={idx}
          className={`rounded-lg border-2 p-6 transition-all duration-300 hover:shadow-lg ${
            tier.highlighted
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          {tier.highlighted && (
            <div className="mb-3 inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </div>
          )}

          <h3 className="text-lg font-bold text-slate-900 mb-1">{tier.name}</h3>
          <p className="text-sm text-slate-600 mb-4">{tier.description}</p>

          <div className="mb-6">
            <span className="text-3xl font-bold text-slate-900">{tier.price}</span>
            <span className="text-slate-600 ml-2">/{tier.period}</span>
          </div>

          <Link href={tier.ctaHref}>
            <Button
              className={`w-full mb-6 ${
                tier.highlighted
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
              }`}
            >
              {tier.cta}
            </Button>
          </Link>

          <div className="space-y-3">
            {tier.features.map((feature, fidx) => (
              <div key={fidx} className="flex items-center gap-3">
                {feature.included ? (
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <X className="w-5 h-5 text-slate-300 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    feature.included ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
