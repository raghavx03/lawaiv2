'use client'

import { Check, X } from 'lucide-react'

interface Feature {
  name: string
  description?: string
  free: boolean
  pro: boolean
  enterprise: boolean
}

interface FeatureComparisonProps {
  features?: Feature[]
}

const defaultFeatures: Feature[] = [
  {
    name: 'Queries per day',
    description: 'Number of contract analyses allowed',
    free: true,
    pro: true,
    enterprise: true,
  },
  {
    name: '5 queries/day',
    free: true,
    pro: false,
    enterprise: false,
  },
  {
    name: 'Unlimited queries',
    free: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Risk scoring',
    description: 'AI-powered risk analysis',
    free: true,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Red flags & warnings',
    free: true,
    pro: true,
    enterprise: true,
  },
  {
    name: 'PDF download',
    description: 'Download analysis as PDF',
    free: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Email support',
    description: '24-hour response time',
    free: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Priority support',
    description: '2-hour response time',
    free: false,
    pro: false,
    enterprise: true,
  },
  {
    name: 'API access',
    description: 'Integrate with your tools',
    free: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Dedicated account manager',
    free: false,
    pro: false,
    enterprise: true,
  },
  {
    name: 'SLA guarantee',
    description: '99.9% uptime SLA',
    free: false,
    pro: false,
    enterprise: true,
  },
]

export default function FeatureComparison({ features = defaultFeatures }: FeatureComparisonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-200">
            <th className="text-left py-4 px-6 font-semibold text-slate-900">Feature</th>
            <th className="text-center py-4 px-6 font-semibold text-slate-900">Free</th>
            <th className="text-center py-4 px-6 font-semibold text-slate-900">Pro</th>
            <th className="text-center py-4 px-6 font-semibold text-slate-900">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, idx) => (
            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 px-6">
                <div>
                  <p className="font-medium text-slate-900">{feature.name}</p>
                  {feature.description && (
                    <p className="text-sm text-slate-500 mt-1">{feature.description}</p>
                  )}
                </div>
              </td>
              <td className="text-center py-4 px-6">
                {feature.free ? (
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                ) : (
                  <X className="w-5 h-5 text-slate-300 mx-auto" />
                )}
              </td>
              <td className="text-center py-4 px-6">
                {feature.pro ? (
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                ) : (
                  <X className="w-5 h-5 text-slate-300 mx-auto" />
                )}
              </td>
              <td className="text-center py-4 px-6">
                {feature.enterprise ? (
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                ) : (
                  <X className="w-5 h-5 text-slate-300 mx-auto" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
