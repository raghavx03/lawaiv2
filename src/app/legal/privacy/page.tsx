import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy | LAW.AI',
    description: 'Privacy Policy for LAW.AI - India\'s AI Legal Assistant',
}

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="lead">Last updated: February 16, 2026</p>

                    <p>
                        At LAW.AI ("we," "our," or "us"), we are committed to protecting your privacy found at lawai.in.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
                        and use our AI-powered legal services.
                    </p>

                    <h2>1. Information We Collect</h2>
                    <p>
                        We collect information that you strictly provide to us for the purpose of generating legal documents,
                        tracking cases, or using our AI assistant. This includes:
                    </p>
                    <ul>
                        <li>Personal identification information (Name, email address, phone number)</li>
                        <li>Case details and legal query data specifically entered by you</li>
                        <li>Usage data and cookies for website performance</li>
                    </ul>

                    <h2>2. Use of Your Information</h2>
                    <p>
                        We use the information we collect to:
                    </p>
                    <ul>
                        <li>Provide, operate, and maintain our services</li>
                        <li>Improve, personalize, and expand our website</li>
                        <li>Understand and analyze how you use our website</li>
                        <li>Develop new products, services, features, and functionality</li>
                        <li>Communicate with you, either directly or through one of our partners</li>
                    </ul>

                    <h2>3. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational security measures to protect your personal information.
                        However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.
                        We use industry-standard encryption for data at rest and in transit.
                    </p>

                    <h2>4. AI Processing</h2>
                    <p>
                        <strong>Important:</strong> We do NOT use your private or confidential case data to train our primary AI models.
                        Your conversations and drafts are processed ephemerally for the purpose of generating the response and are stored securely
                        linked only to your account for your history.
                    </p>

                    <h2>5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us:
                    </p>
                    <ul>
                        <li>By email: support@lawai.in</li>
                        <li>By visiting this page on our website: <a href="https://lawai.in/contact">lawai.in/contact</a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
