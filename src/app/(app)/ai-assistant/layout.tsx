import { Metadata } from 'next'
import { AIAssistantWrapper } from '@/components/ai-assistant/AIAssistantWrapper'

export const metadata: Metadata = {
  title: 'Indian Law AI Assistant for Lawyers',
  description: 'Ask legal questions about IPC, CrPC, divorce, bail, property, contracts in Hindi or English. LAW.AI is an AI legal assistant trained on Indian law for advocates.',
  keywords: [
    'AI legal assistant India',
    'Indian law chatbot',
    'legal AI Hindi',
    'IPC sections AI',
    'CrPC AI assistant',
    'bail provisions AI',
    'divorce law AI India',
    'property law AI',
    'contract law AI India',
    'advocate AI tool'
  ],
  openGraph: {
    title: 'Indian Law AI Assistant | LAW.AI',
    description: 'Ask legal questions in Hindi or English. Get answers based on IPC, CrPC, CPC, and Indian court precedents.',
    url: 'https://lawai.in/ai-assistant'
  },
  alternates: {
    canonical: 'https://lawai.in/ai-assistant'
  }
}

export default function AIAssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AIAssistantWrapper>
      {children}
    </AIAssistantWrapper>
  )
}
