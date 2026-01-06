import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Indian Judgment Summarizer AI - Court Order Analysis',
  description: 'Upload court judgments and get AI-powered summaries. Extract key issues, arguments, and orders from Supreme Court and High Court judgments.',
  keywords: [
    'judgment summarizer India',
    'court order summary AI',
    'Supreme Court judgment summary',
    'High Court judgment analysis',
    'legal document summarizer',
    'case summary AI',
    'judgment analysis tool',
    'court order AI',
    'legal summary generator',
    'advocate judgment tool'
  ],
  openGraph: {
    title: 'Judgment Summarizer AI | LAW.AI',
    description: 'Get AI-powered summaries of Indian court judgments. Extract key issues, arguments, and final orders.',
    url: 'https://lawai.in/summarizer'
  },
  alternates: {
    canonical: 'https://lawai.in/summarizer'
  }
}

export default function SummarizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
