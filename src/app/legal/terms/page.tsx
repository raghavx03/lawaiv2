import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Service | LAW.AI',
    description: 'Terms of Service for LAW.AI - India\'s AI Legal Assistant',
}

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="lead">Last updated: February 16, 2026</p>

                    <p>
                        Please read these Terms of Service ("Terms") carefully before using the LAW.AI platform ("Service") operated by RAGSPRO ("us", "we", or "our").
                    </p>

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms,
                        then you may not access the Service.
                    </p>

                    <h2>2. AI Legal Disclaimer</h2>
                    <p>
                        <strong>LAW.AI is an AI-powered tool, not a law firm or a substitute for a lawyer.</strong>
                        The information provided by our AI is for informational and research purposes only.
                        We do not provide legal advice, and no attorney-client relationship is formed by your use of the Service.
                        Always consult with a qualified advocate for official legal representation.
                    </p>

                    <h2>3. User Accounts</h2>
                    <p>
                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times.
                        Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                    </p>

                    <h2>4. Subscription and Payments</h2>
                    <p>
                        Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring
                        and periodic basis (such as monthly or annually). Billing cycles are set either on a monthly or annual basis, depending on the type of
                        subscription plan you select when purchasing a Subscription.
                    </p>

                    <h2>5. Limitation of Liability</h2>
                    <p>
                        In no event shall LAW.AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect,
                        incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other
                        intangible losses, resulting from your access to or use of or inability to access or use the Service.
                    </p>

                    <h2>6. Governing Law</h2>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                        Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
                    </p>

                    <h2>7. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at support@lawai.in.
                    </p>
                </div>
            </div>
        </div>
    )
}
