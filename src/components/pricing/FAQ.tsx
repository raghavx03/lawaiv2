'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  items?: FAQItem[]
}

const defaultItems: FAQItem[] = [
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer:
      "Yes, you can change your plan at any time. If you upgrade, you'll only pay the difference. If you downgrade, we'll credit the difference to your account.",
  },
  {
    question: 'Is there a free trial for Pro?',
    answer: 'Yes, we offer a 14-day free trial for Pro. No credit card required to start.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) and digital wallets through Stripe.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.",
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes, you can cancel your subscription anytime. Your access will continue until the end of your billing period.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes, annual billing saves you 17% compared to monthly billing.',
  },
  {
    question: 'What is the API rate limit?',
    answer: 'Pro tier: 100 requests/minute. Enterprise: Custom limits available.',
  },
  {
    question: 'Do you offer team plans?',
    answer:
      'Yes, Enterprise plans include team management. Contact our sales team for details.',
  },
]

export default function FAQ({ items = defaultItems }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors animate-slide-up"
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
          >
            <h3 className="text-left font-semibold text-slate-900">{item.question}</h3>
            <ChevronDown
              className={`w-5 h-5 text-slate-600 flex-shrink-0 transition-transform ${
                openIndex === idx ? 'transform rotate-180' : ''
              }`}
            />
          </button>

          {openIndex === idx && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 animate-slide-down">
              <p className="text-slate-600">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}



const styles = `
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 500px;
    }
  }

  .animate-slide-up {
    animation: slide-up 0.4s ease-out;
  }

  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
`
