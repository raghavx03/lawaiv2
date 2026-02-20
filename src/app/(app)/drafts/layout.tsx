import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Draft Generator India - Create Legal Documents',
  description: 'Generate legal documents instantly: Rental Agreements, Legal Notices, NDAs, Affidavits, Sale Deeds. AI-powered document drafting for Indian lawyers.',
  keywords: [
    'legal draft generator India',
    'rental agreement generator',
    'legal notice generator',
    'NDA generator India',
    'affidavit generator',
    'sale deed generator',
    'legal document AI',
    'advocate document tool',
    'contract generator India',
    'legal template India'
  ],
  openGraph: {
    title: 'Legal Draft Generator | LAW.AI',
    description: 'Generate professional legal documents in minutes. Rental agreements, legal notices, NDAs, and more.',
    url: 'https://lawai.in/drafts'
  },
  alternates: {
    canonical: 'https://lawai.in/drafts'
  }
}

export default function DraftsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
