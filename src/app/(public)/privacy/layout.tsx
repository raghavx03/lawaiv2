import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - LAW.AI',
  description: 'LAW.AI Privacy Policy. Learn how we collect, use, and protect your data. Your privacy and data security are our top priorities.',
  keywords: [
    'LAW.AI privacy policy',
    'legal AI data protection',
    'lawyer data privacy',
  ],
  openGraph: {
    title: 'Privacy Policy - LAW.AI',
    description: 'Learn how LAW.AI collects, uses, and protects your data.',
    type: 'website',
    url: 'https://lawai.in/privacy',
  },
  alternates: {
    canonical: 'https://lawai.in/privacy',
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
