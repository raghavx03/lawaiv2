import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Refund Policy | LAW.AI',
    description: 'Refund & Cancellation Policy for LAW.AI',
}

export default function RefundPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Refund & Cancellation Policy</h1>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="lead">Last updated: February 16, 2026</p>

                    <h2>1. Free Trial</h2>
                    <p>
                        LAW.AI offers a <strong>7-day free trial</strong> for all new users. During this period, you can use all features of the Pro plan
                        without any charge. You will not be charged if you cancel before the trial ends.
                    </p>

                    <h2>2. Subscription Refunds</h2>
                    <p>
                        <strong>Monthly Subscriptions:</strong> You can cancel your monthly subscription at any time. The cancellation will take effect at
                        the end of the current billing cycle. We generally do not offer refunds for partial months of service.
                    </p>
                    <p>
                        <strong>Annual Subscriptions:</strong> If you cancel an annual subscription within 7 days of payment, you may be eligible for a
                        pro-rated refund. After 7 days, cancellations will take effect at the end of the current annual term.
                    </p>

                    <h2>3. Technical Issues</h2>
                    <p>
                        If you experience a technical error that prevents you from using the service for more than 24 hours, and our support team is unable
                        to resolve it, you may be eligible for a refund for that billing period. Please contact support@lawai.in with proof of the issue.
                    </p>

                    <h2>4. Cancellation Process</h2>
                    <p>
            You can cancel your subscription at any time from the "Settings" > "Billing" section of your dashboard. Alternatively, you can
                        email us at support@lawai.in with your registered email address.
                    </p>

                    <h2>5. Contact Us</h2>
                    <p>
                        For any billing or refund related queries, please contact our support team at support@lawai.in.
                    </p>
                </div>
            </div>
        </div>
    )
}
