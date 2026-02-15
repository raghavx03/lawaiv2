'use client'

import { LegalNavbar } from '@/components/landing/legal-navbar'
import { LegalHero } from '@/components/landing/legal-hero'
import { LegalPreview } from '@/components/landing/legal-preview'
import { LegalFeatures } from '@/components/landing/legal-features'
import { LegalHowItWorks } from '@/components/landing/legal-how-it-works'
import { LegalPricing } from '@/components/landing/legal-pricing'
import { LegalTestimonials } from '@/components/landing/legal-testimonials'
import { LegalFAQ } from '@/components/landing/legal-faq'
import { LegalCTA } from '@/components/landing/legal-cta'
import { LegalFooter } from '@/components/landing/legal-footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden animate-in">
      <LegalNavbar />
      <LegalHero />
      <LegalPreview />
      <LegalFeatures />
      <LegalHowItWorks />
      <LegalPricing />
      <LegalTestimonials />
      <LegalFAQ />
      <LegalCTA />
      <LegalFooter />
    </main>
  )
}
