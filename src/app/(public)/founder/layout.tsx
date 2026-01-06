import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Raghav Shah - Founder & CEO | LAW.AI',
  description: 'Meet Raghav Shah, founder of LAW.AI and RAGSPRO. Learn about his vision to democratize legal technology and make AI-powered legal tools accessible to every lawyer in India.',
  keywords: [
    'Raghav Shah',
    'LAW.AI founder',
    'RAGSPRO founder',
    'legal tech entrepreneur India',
    'LAW.AI CEO',
    'legal AI startup founder',
    'Indian legal tech',
    'ragspro.com',
    'legal technology innovator'
  ],
  openGraph: {
    title: 'Raghav Shah - Founder & CEO | LAW.AI',
    description: 'Meet Raghav Shah, founder of LAW.AI and RAGSPRO. Learn about his vision to democratize legal technology in India.',
    type: 'profile',
    url: 'https://lawai.in/founder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raghav Shah - Founder & CEO | LAW.AI',
    description: 'Meet Raghav Shah, founder of LAW.AI and RAGSPRO.',
  },
  alternates: {
    canonical: 'https://lawai.in/founder'
  }
}

export default function FounderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
