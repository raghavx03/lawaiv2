import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - LAW.AI Support',
  description: 'Get in touch with LAW.AI team. Contact us for support, queries, or feedback about our AI-powered legal assistant. Email: ragsproai@gmail.com, Phone: +91 8826073013',
  keywords: [
    'contact LAW.AI',
    'legal AI support',
    'LAW.AI help',
    'legal tech support India',
  ],
  openGraph: {
    title: 'Contact Us - LAW.AI Support',
    description: 'Get in touch with LAW.AI team for support, queries, or feedback.',
    type: 'website',
    url: 'https://lawai.in/contact',
  },
  alternates: {
    canonical: 'https://lawai.in/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
