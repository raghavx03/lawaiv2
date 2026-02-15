import { LegalNavbar } from '@/components/landing/legal-navbar'
import { LegalFooter } from '@/components/landing/legal-footer'

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <LegalNavbar />
            <main className="flex-grow pt-16">
                {children}
            </main>
            <LegalFooter />
        </div>
    )
}
