import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How AI is Transforming Indian Legal System | LAW.AI',
  description: 'Discover how AI technology is revolutionizing Indian law, addressing weaknesses in the legal system, and creating opportunities for faster, more accessible justice for all citizens.',
  keywords: [
    'AI in Indian law',
    'legal technology India',
    'Indian legal system transformation',
    'AI legal assistant India',
    'legal tech revolution',
    'Indian judiciary AI',
    'court case management AI',
    'legal document automation India',
    'access to justice India',
    'legal AI solutions',
    'Indian law AI tools',
    'legal research AI India',
    'court case delays India',
    'affordable legal services India',
    'legal tech startups India'
  ],
  openGraph: {
    title: 'How AI is Transforming Indian Legal System | LAW.AI',
    description: 'Discover how AI technology is revolutionizing Indian law, addressing weaknesses in the legal system, and creating opportunities for faster, more accessible justice.',
    type: 'article',
    url: 'https://lawai.in/indian-law-ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How AI is Transforming Indian Legal System',
    description: 'Discover how AI technology is revolutionizing Indian law and creating a more accessible justice system.',
  },
  alternates: {
    canonical: 'https://lawai.in/indian-law-ai'
  }
}

export default function IndianLawAILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
