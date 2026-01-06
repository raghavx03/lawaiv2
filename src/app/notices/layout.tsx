import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Notice Generator India - Create Professional Notices',
  description: 'Generate professional legal notices: Cheque bounce (Section 138), eviction, recovery, defamation notices. AI-powered for Indian lawyers.',
  keywords: [
    'legal notice generator',
    'cheque bounce notice',
    'Section 138 notice',
    'eviction notice India',
    'recovery notice',
    'defamation notice',
    'legal notice format',
    'advocate notice tool',
    'demand notice generator',
    'legal notice template India'
  ],
  openGraph: {
    title: 'Legal Notice Generator | LAW.AI',
    description: 'Generate professional legal notices instantly. Section 138, eviction, recovery notices.',
    url: 'https://lawai.in/notices'
  },
  alternates: {
    canonical: 'https://lawai.in/notices'
  }
}

export default function NoticesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
