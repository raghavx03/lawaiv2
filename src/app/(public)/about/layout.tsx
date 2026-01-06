import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About LAW.AI - India\'s #1 AI Legal Assistant',
  description: 'Learn about LAW.AI, India\'s most advanced AI-powered legal assistant. Founded by Raghav Shah of RAGSPRO. Trusted by 10,000+ advocates. Save 15+ hours weekly with AI-powered legal tools.',
  keywords: [
    'about LAW.AI',
    'legal AI company India',
    'Raghav Shah',
    'RAGSPRO',
    'legal tech startup India',
    'AI legal assistant company',
    'law firm technology',
  ],
  openGraph: {
    title: 'About LAW.AI - India\'s #1 AI Legal Assistant',
    description: 'Learn about LAW.AI, India\'s most advanced AI-powered legal assistant for lawyers.',
    type: 'website',
    url: 'https://lawai.in/about',
  },
  alternates: {
    canonical: 'https://lawai.in/about',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
