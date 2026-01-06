import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | LAW.AI - Legal AI Platform',
  description: 'Read the terms of service for LAW.AI, India\'s leading AI-powered legal assistant. Understand your rights, responsibilities, and our service commitments.',
  keywords: [
    'LAW.AI terms of service',
    'legal AI terms',
    'LAW.AI user agreement',
    'legal tech terms',
    'AI legal assistant terms',
    'LAW.AI service agreement',
    'legal platform terms India'
  ],
  openGraph: {
    title: 'Terms of Service | LAW.AI',
    description: 'Read the terms of service for LAW.AI, India\'s leading AI-powered legal assistant.',
    type: 'website',
    url: 'https://lawai.in/terms'
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | LAW.AI',
    description: 'Read the terms of service for LAW.AI, India\'s leading AI-powered legal assistant.'
  },
  alternates: {
    canonical: 'https://lawai.in/terms'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
