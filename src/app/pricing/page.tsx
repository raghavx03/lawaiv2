'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, X, Sparkles } from 'lucide-react'
import { PremiumButton, PremiumCard } from '@/components/premium'
import PricingCard from '@/components/pricing/PricingCard'
import FeatureComparison from '@/components/pricing/FeatureComparison'
import FAQ from '@/components/pricing/FAQ'

export default function PricingPage() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

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
        { name: 'Dedicated account manager', included: false },
        { name: 'SLA guarantee', included: false },
      ],
      cta: 'Get Started',
      ctaHref: '/auth/signup',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? '$29' : '$290',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For professionals and small teams',
      features: [
        { name: 'Unlimited queries', included: true },
        { name: 'Advanced risk scoring', included: true },
        { name: 'Red flags & warnings', included: true },
        { name: 'PDF download', included: true },
        { name: 'Email support', included: true },
        { name: 'API access', included: true },
        { name: 'Dedicated account manager', included: false },
        { name: 'SLA guarantee', included: false },
      ],
      cta: 'Start Free Trial',
      ctaHref: '/auth/signup?plan=pro',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations',
      features: [
        { name: 'Unlimited queries', included: true },
        { name: 'Advanced risk scoring', included: true },
        { name: 'Red flags & warnings', included: true },
        { name: 'PDF download', included: true },
        { name: 'Priority support', included: true },
        { name: 'API access', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'SLA guarantee', included: true },
      ],
      cta: 'Contact Sales',
      ctaHref: 'mailto:sales@lawai.in',
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <PremiumButton
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </PremiumButton>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-premium-h1 text-slate-900 dark:text-white">Simple, Transparent Pricing</h1>
            <p className="text-premium-body text-slate-600 dark:text-slate-400 mt-2">
              Choose the perfect plan for your needs
            </p>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center py-8 px-4">
        <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-indigo-600 dark:bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'annual'
                ? 'bg-indigo-600 dark:bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Annual
            <span className="ml-2 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div key={idx}>
              <PricingCard
                name={tier.name}
                price={tier.price}
                period={tier.period}
                description={tier.description}
                features={tier.features}
                cta={tier.cta}
                ctaHref={tier.ctaHref}
                highlighted={tier.highlighted}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-white dark:bg-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-premium-h2 text-slate-900 dark:text-white mb-12 text-center">
            Feature Comparison
          </h2>
          <FeatureComparison />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-premium-h2 text-slate-900 dark:text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <FAQ />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-indigo-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-premium-h1 text-white mb-4">Ready to get started?</h2>
          <p className="text-premium-body text-indigo-100 mb-8">
            Join thousands of lawyers and founders using LAW.AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contract-analyzer">
              <PremiumButton size="lg" variant="secondary">
                <Sparkles className="h-4 w-4" />
                Try Contract Analyzer
              </PremiumButton>
            </Link>
            <Link href="/auth/signup">
              <PremiumButton
                size="lg"
                variant="ghost"
                className="text-white border-white hover:bg-white/10"
              >
                Create Free Account
              </PremiumButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
