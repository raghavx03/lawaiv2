'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-grade encryption (AES-256) for all data. Your documents and conversations are encrypted at rest and in transit. We never share your data with third parties, and you can delete your data anytime.'
  },
  {
    question: 'Is this built for Indian law?',
    answer: 'Yes, LAW.AI is specifically designed for Indian legal professionals. Our AI is trained on Indian statutes, case laws, and legal procedures. It understands IPC, CrPC, CPC, and other Indian legal frameworks.'
  },
  {
    question: 'Do I need legal tech knowledge?',
    answer: 'Not at all. LAW.AI is designed to be intuitive and easy to use. If you can use email, you can use LAW.AI. We also provide tutorials and support to help you get started.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your access continues until the end of your billing period.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including credit/debit cards, UPI, net banking, and wallets through Razorpay. All transactions are secure and encrypted.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start. You can explore all features before deciding to subscribe.'
  }
]

export function LegalFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative py-24 sm:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-16">
          <span className="inline-block px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-gray-600 text-sm font-medium mb-6">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-5 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Everything you need to know about LAW.AI
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index}>
              <div 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  openIndex === index 
                    ? 'border-gray-300 shadow-[0_10px_30px_rgba(0,0,0,0.06)]' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4 text-[17px]">{faq.question}</span>
                  <div 
                    className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  >
                    <ChevronDown size={18} className="text-gray-500" />
                  </div>
                </button>
                
                {openIndex === index && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4 text-[15px]">
                    {faq.answer}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
