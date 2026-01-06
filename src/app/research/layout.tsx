import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Research AI India - Case Laws & Acts Search',
  description: 'Search Indian laws, acts, and case laws. Find Supreme Court and High Court judgments with AI-powered legal research for advocates.',
  keywords: [
    'legal research India',
    'case law search India',
    'Indian law search',
    'Supreme Court judgments search',
    'High Court case search',
    'IPC sections search',
    'CrPC search',
    'legal database India',
    'advocate research tool',
    'law research AI'
  ],
  openGraph: {
    title: 'Legal Research AI | LAW.AI',
    description: 'AI-powered legal research. Search Indian laws, case laws, and court judgments.',
    url: 'https://lawai.in/research'
  },
  alternates: {
    canonical: 'https://lawai.in/research'
  }
}

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
