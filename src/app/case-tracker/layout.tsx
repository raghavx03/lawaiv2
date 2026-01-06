import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CNR Case Status Tracker - Track Court Cases India',
  description: 'Track court cases using CNR number. Get real-time updates on case status, next hearing dates from Supreme Court, High Courts, and District Courts.',
  keywords: [
    'CNR case status',
    'court case tracker India',
    'case status by CNR',
    'ecourts case status',
    'Supreme Court case tracker',
    'High Court case status',
    'District Court case tracker',
    'next hearing date',
    'case history India',
    'advocate case tracker'
  ],
  openGraph: {
    title: 'CNR Case Tracker | LAW.AI',
    description: 'Track any court case in India using CNR number. Get real-time status updates and hearing dates.',
    url: 'https://lawai.in/case-tracker'
  },
  alternates: {
    canonical: 'https://lawai.in/case-tracker'
  }
}

export default function CaseTrackerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
