'use client'

import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Feature {
  name: string
  included: boolean
}

interface PricingCardProps {
  name: string
  price: string
  period: string
  description: string
  features: Feature[]
  cta: string
  ctaHref: string
  highlighted?: boolean
}

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  highlighted = false,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-lg border-2 p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        highlighted
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg md:scale-105'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      {highlighted && (
        <div className="mb-4 inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold text-slate-900 mb-2">{name}</h3>
      <p className="text-slate-600 mb-6">{description}</p>

      <div className="mb-6">
        <span className="text-4xl font-bold text-slate-900">{price}</span>
        <span className="text-slate-600 ml-2">/{period}</span>
      </div>

      <Link href={ctaHref}>
        <Button
          className={`w-full mb-8 ${
            highlighted
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
          }`}
        >
          {cta}
        </Button>
      </Link>

      <div className="space-y-4">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3">
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
  )
}
