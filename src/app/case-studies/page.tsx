import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, TrendingUp, Clock, Shield } from 'lucide-react'
import { LegalFooter } from '@/components/landing/legal-footer'

export const metadata: Metadata = {
    title: 'Success Stories & Case Studies | LAW.AI',
    description: 'See how Indian lawyers and law firms are using LAW.AI to save time, win cases, and grow their practice.',
}

const caseStudies = [
    {
        id: 1,
        title: 'How Adv. Sharma Reduced Research Time by 70% in a Complex Property Dispute',
        category: 'Civil Law',
        challenge: 'Adv. Sharma was handling a 20-year-old partition suit with thousands of pages of documents and conflicting High Court judgments. Manual research was taking weeks.',
        solution: 'He used LAW.AI to upload case files and ask specific questions. The AI summarized the documents, highlighted contradictions, and found 5 relevant Supreme Court precedents in minutes.',
        result: 'Filed a watertight written statement in 2 days instead of 2 weeks. Won a favorable interim order.',
        stat: '70% Time Saved',
        icon: Clock
    },
    {
        id: 2,
        title: 'Scaling a Solo Practice: From 5 to 20 Clients a Month',
        category: 'Practice Management',
        challenge: 'Adv. Priya was overwhelmed with client calls, drafting notices, and managing dates. She was turning away new clients due to lack of time.',
        solution: 'She automated client intake with LAW.AI\'s CRM and used the AI Drafter to generate Legal Notices and Rent Agreements instantly.',
        result: 'Freed up 4 hours daily. scaled her practice to 20 active clients without hiring a junior.',
        stat: '4x Client Growth',
        icon: TrendingUp
    },
    {
        id: 3,
        title: 'Defending a Section 138 Cheque Bounce Case with AI Precision',
        category: 'Criminal Law',
        challenge: 'A small business owner was falsely accused in a cheque bounce case. The evidence was technical and buried in bank statements.',
        solution: 'LAW.AI analyzed 6 months of bank statements to trace the flow of funds and drafted a strong reply notice citing recent NI Act judgments.',
        result: 'The complainant agreed to settle out of court after seeing the detailed reply.',
        stat: '100% Accuracy',
        icon: Shield
    }
]

export default function CaseStudiesPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                        Real Results, Real Lawyers
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                        See how LAW.AI is transforming legal practice in India.
                    </p>
                </div>
            </div>

            {/* Case Studies Grid */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-3">
                    {caseStudies.map((study) => (
                        <div key={study.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                            <div className="p-8 flex-1">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400">
                                        <study.icon className="w-6 h-6" />
                                    </span>
                                    <span className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                                        {study.category}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                    {study.title}
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Challenge
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                            {study.challenge}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> AI Solution
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                            {study.solution}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Outcome
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                            {study.result}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Impact</p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{study.stat}</p>
                                </div>
                                <Link href="/auth/signup" className="text-green-600 dark:text-green-400 font-medium hover:text-green-700 flex items-center text-sm">
                                    Try it yourself <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="bg-green-600 dark:bg-green-900 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Be the Next Success Story
                    </h2>
                    <p className="text-green-100 mb-8 text-lg">
                        Join 10,000+ legal professionals modernizing their practice.
                    </p>
                    <Link
                        href="/auth/signup"
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-50 md:text-lg md:px-10 transition-all shadow-lg"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </div>

            <LegalFooter />
        </div>
    )
}
