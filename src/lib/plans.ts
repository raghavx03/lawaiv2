export const PRICING_PLANS = [
  {
    name: 'Free',
    price: 0,
    currency: '₹',
    period: 'forever',
    description: 'Perfect for trying out LAW.AI',
    features: [
      '3 core features',
      '10 queries total',
      '7-day trial period',
      'Basic support'
    ],
    limitations: [
      'Limited to 10 queries OR 7 days',
      'AI Assistant',
      'Document Generator', 
      'Judgment Summarizer'
    ],
    buttonText: 'Get Started',
    popular: false
  },
  {
    name: 'Basic',
    price: 499,
    currency: '₹',
    period: 'month',
    description: 'Unlimited access to core features',
    features: [
      'Unlimited queries',
      'AI Assistant',
      'Document Generator',
      'Judgment Summarizer',
      'Email support'
    ],
    buttonText: 'Upgrade to Basic',
    popular: false
  },
  {
    name: 'Plus',
    price: 999,
    currency: '₹',
    period: 'month',
    description: 'Extended legal toolkit',
    features: [
      'All Basic features',
      'CRM System',
      'Acts Database',
      'Legal News',
      'Priority support'
    ],
    buttonText: 'Upgrade to Plus',
    popular: false
  },
  {
    name: 'Pro',
    price: 1499,
    currency: '₹',
    period: 'month',
    description: 'Complete legal AI platform',
    features: [
      'All 9 features',
      'Unlimited queries',
      'Case Tracker',
      'Legal Notices',
      'Advanced Drafts',
      'Priority support'
    ],
    buttonText: 'Upgrade to Pro',
    popular: true
  }
]

export const PLAN_FEATURES = {
  FREE: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER'],
  BASIC: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER'],
  PLUS: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER', 'CRM', 'ACTS', 'NEWS'],
  PRO: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER', 'CRM', 'ACTS', 'NEWS', 'CASE_TRACKER', 'NOTICES', 'DRAFTS'],
  PREMIUM: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER', 'CRM', 'ACTS', 'NEWS', 'CASE_TRACKER', 'NOTICES', 'DRAFTS']
} as const

export const PLAN_LIMITS = {
  FREE: { queries: 10, days: 7 },
  BASIC: { queries: -1, days: -1 }, // unlimited
  PLUS: { queries: -1, days: -1 }, // unlimited
  PRO: { queries: -1, days: -1 } // unlimited
} as const

export type PlanType = keyof typeof PLAN_FEATURES
export type FeatureType = typeof PLAN_FEATURES[PlanType][number]