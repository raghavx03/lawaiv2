import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Tech Blog - AI for Lawyers | LAW.AI',
  description: 'Expert articles on AI in legal practice, document drafting, case management, legal research, and more. Stay ahead with the latest in legal technology for Indian lawyers.',
  keywords: [
    'legal tech blog',
    'AI for lawyers blog',
    'legal technology articles',
    'Indian law blog',
    'lawyer tips',
    'legal document drafting guide',
    'case management tips',
    'legal research techniques',
    'law firm technology',
    'legal AI news'
  ],
  openGraph: {
    title: 'Legal Tech Blog - AI for Lawyers | LAW.AI',
    description: 'Expert articles on AI in legal practice, document drafting, case management, and more.',
    type: 'website',
    url: 'https://lawai.in/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal Tech Blog - AI for Lawyers | LAW.AI',
    description: 'Expert articles on AI in legal practice for Indian lawyers.',
  },
  alternates: {
    canonical: 'https://lawai.in/blog',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
