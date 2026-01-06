import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/mobile-modal.css'
import '../styles/accessibility.css'
import '../styles/performance.css'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ConfigWarning } from '@/components/shared/ConfigWarning'
import { ThemeProvider } from '@/context/ThemeContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { GlobalLoader } from '@/components/ui/GlobalLoader'
import { SpeedInsights } from '@vercel/speed-insights/next'
import dynamic from 'next/dynamic'
import '@/lib/performance'
import '@/lib/app-initialization'

const AuthProviderWrapper = dynamic(() => import('@/components/providers/AuthProviderWrapper').then(mod => ({ default: mod.AuthProviderWrapper })), {
  ssr: false
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LAW-AI - AI-Powered Legal Platform | Document Generation, Case Tracking & Legal Research',
  description: 'Complete AI-powered legal SaaS platform for lawyers and legal professionals. Generate legal documents, track court cases, research laws, and get AI assistance. Free & paid plans available.',
  keywords: 'legal AI, law software, legal document generator, case tracker, legal research, AI lawyer, legal SaaS, court case management',
  authors: [{ name: 'LAW-AI Team' }],
  metadataBase: new URL('https://lawai.ragspro.com'),
  openGraph: {
    title: 'LAW-AI - AI-Powered Legal Platform',
    description: 'Complete AI-powered legal SaaS platform for lawyers and legal professionals.',
    url: 'https://lawai.ragspro.com',
    siteName: 'LAW-AI',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'google431c847c1de56ddb',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="google431c847c1de56ddb" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const STORAGE_KEY = 'law-ai-theme';
                const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                
                let theme = localStorage.getItem(STORAGE_KEY) || 'light'; // Default to light
                let resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
                
                if (!['light', 'dark'].includes(resolvedTheme)) {
                  resolvedTheme = 'light';
                }
                
                const root = document.documentElement;
                const isDark = resolvedTheme === 'dark';
                
                root.classList.toggle('dark', isDark);
                root.setAttribute('data-theme', resolvedTheme);
                root.style.colorScheme = resolvedTheme;
                
                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                const themeColor = isDark ? '#111827' : '#ffffff';
                if (metaThemeColor) {
                  metaThemeColor.setAttribute('content', themeColor);
                } else {
                  const meta = document.createElement('meta');
                  meta.name = 'theme-color';
                  meta.content = themeColor;
                  document.head.appendChild(meta);
                }
                
                if (theme === 'system') {
                  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                  const handleChange = () => {
                    const newResolvedTheme = getSystemTheme();
                    const newIsDark = newResolvedTheme === 'dark';
                    root.classList.toggle('dark', newIsDark);
                    root.setAttribute('data-theme', newResolvedTheme);
                    root.style.colorScheme = newResolvedTheme;
                  };
                  mediaQuery.addEventListener('change', handleChange);
                }
              } catch (e) {
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
                document.documentElement.style.colorScheme = 'light';
              }
            })()
          `
        }} />

        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Content-Security-Policy" content="frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com;" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-900 overflow-x-hidden touch-manipulation`} suppressHydrationWarning>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        <ErrorBoundary>
          <ThemeProvider>
            <AuthProviderWrapper>
              <NotificationProvider>
                {children}
              </NotificationProvider>
              <Toaster 
                position="top-right" 
                toastOptions={{
                  className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700',
                  duration: 4000,
                  style: {
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)'
                  }
                }}
              />
              <ConfigWarning />
            </AuthProviderWrapper>
          </ThemeProvider>
        </ErrorBoundary>
        <SpeedInsights />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Initialize error monitoring
            window.addEventListener('load', function() {
              if (window.ErrorMonitor) {
                window.ErrorMonitor.getInstance().init();
              }
            });
          `
        }} />
      </body>
    </html>
  )
}