import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lawyer CRM India - Client Management for Advocates',
  description: 'Manage clients, appointments, and case deadlines. CRM software designed for Indian lawyers and law firms.',
  keywords: [
    'lawyer CRM India',
    'advocate client management',
    'law firm CRM',
    'legal practice management',
    'client management lawyers',
    'appointment scheduler lawyers',
    'case deadline tracker',
    'law office software India',
    'advocate practice tool',
    'legal CRM software'
  ],
  openGraph: {
    title: 'Lawyer CRM | LAW.AI',
    description: 'Client management software for Indian lawyers. Track clients, appointments, and deadlines.',
    url: 'https://lawai.in/crm'
  },
  alternates: {
    canonical: 'https://lawai.in/crm'
  }
}

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
