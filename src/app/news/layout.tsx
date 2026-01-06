import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal News India - Latest Law Updates for Lawyers',
  description: 'Stay updated with latest legal news, Supreme Court judgments, High Court orders, and legal developments in India.',
  keywords: [
    'legal news India',
    'law news today',
    'Supreme Court news',
    'High Court updates',
    'legal updates India',
    'lawyer news',
    'court news India',
    'legal developments',
    'bar council news',
    'advocate news'
  ],
  openGraph: {
    title: 'Legal News India | LAW.AI',
    description: 'Latest legal news and court updates for Indian lawyers.',
    url: 'https://lawai.in/news'
  },
  alternates: {
    canonical: 'https://lawai.in/news'
  }
}

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
