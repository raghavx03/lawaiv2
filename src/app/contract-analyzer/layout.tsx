import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contract Risk Analyzer | LAW.AI',
  description: 'Analyze your contract in 3 seconds. Get instant risk assessment, red flags, and suggested revisions.',
}

export default function ContractAnalyzerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
