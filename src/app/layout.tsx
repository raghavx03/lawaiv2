import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CaseProvider } from '@/context/CaseContext'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://lawai.in'),
  title: {
    default: 'LAW.AI - #1 AI Legal Assistant for Indian Lawyers | Legal Tech India',
    template: '%s | LAW.AI - AI Legal Assistant India'
  },
  description: 'LAW.AI is India\'s most advanced AI-powered legal assistant. Draft legal documents, research Indian case laws, track court cases by CNR, summarize judgments, and manage clients. Trusted by 10,000+ advocates. 7-day free trial. Built for Indian lawyers, advocates, and law firms.',
  keywords: [
    // Primary Keywords
    'AI legal assistant India',
    'legal AI India',
    'AI for lawyers India',
    'legal tech India',
    'lawyer software India',
    // Feature Keywords
    'legal document generator',
    'case tracker CNR',
    'judgment summarizer AI',
    'legal research AI',
    'client management lawyers',
    'legal notice generator',
    'rental agreement generator',
    'NDA generator India',
    // Indian Law Keywords
    'Indian law AI',
    'IPC sections search',
    'CrPC provisions',
    'Indian Penal Code AI',
    'Supreme Court judgments',
    'High Court case search',
    'Section 138 NI Act',
    'bail provisions India',
    // Long-tail Keywords
    'best AI tool for lawyers India',
    'legal document drafting software',
    'court case tracking app India',
    'AI legal research tool',
    'law firm management software India',
    'advocate practice management',
    // Location Keywords
    'legal software Delhi',
    'lawyer app Mumbai',
    'legal tech Bangalore',
    'advocate software Chennai',
    // AEO Keywords (Answer Engine Optimization)
    'how to track court case India',
    'how to draft legal notice',
    'what is CNR number',
    'how to research Indian law',
    'best legal AI assistant'
  ],
  authors: [{ name: 'Raghav Shah', url: 'https://ragspro.com' }, { name: 'RAGSPRO', url: 'https://ragspro.com' }],
  creator: 'RAGSPRO',
  publisher: 'LAW.AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://lawai.in',
    siteName: 'LAW.AI',
    title: 'LAW.AI - #1 AI Legal Assistant for Indian Lawyers',
    description: 'India\'s most advanced AI-powered legal assistant. Draft documents, research case laws, track court cases, summarize judgments. Trusted by 10,000+ advocates. 7-day free trial.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LAW.AI - #1 AI Legal Assistant for Indian Lawyers',
    description: 'India\'s most advanced AI-powered legal assistant. Draft documents, research case laws, track court cases. 7-day free trial.',
    creator: '@lawai_india',
    site: '@lawai_india',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  alternates: {
    canonical: 'https://lawai.in',
    languages: {
      'en-IN': 'https://lawai.in',
      'hi-IN': 'https://lawai.in/hi',
    },
  },
  category: 'Legal Technology',
  verification: {
    google: 'google-site-verification-code',
  },
  other: {
    'geo.region': 'IN',
    'geo.placename': 'India',
    'geo.position': '20.5937;78.9629',
    'ICBM': '20.5937, 78.9629',
    'rating': 'General',
    'distribution': 'Global',
    'revisit-after': '7 days',
    'language': 'English',
    'target': 'all',
    'audience': 'Lawyers, Advocates, Law Firms, Legal Professionals',
    'coverage': 'India',
    'classification': 'Legal Technology, AI Software, SaaS',
  },
}

// JSON-LD Structured Data - Software Application
const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LAW.AI',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Legal Software',
  operatingSystem: 'Web Browser',
  description: 'AI-powered legal assistant for Indian lawyers. Features include document drafting, case tracking, legal research, judgment summarization, and client management.',
  url: 'https://lawai.in',
  downloadUrl: 'https://lawai.in/auth/signup',
  softwareVersion: '2.0',
  releaseNotes: 'Latest version with AI-powered features for Indian lawyers',
  author: {
    '@type': 'Organization',
    name: 'RAGSPRO',
    url: 'https://ragspro.com'
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: '7-day free trial, then ₹999/month for Pro plan',
    availability: 'https://schema.org/InStock'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '2500',
    bestRating: '5',
    worstRating: '1',
    reviewCount: '1200'
  },
  featureList: [
    'AI Legal Assistant - Ask legal questions in natural language',
    'Document Generator - Create legal documents in minutes',
    'Case Tracker - Track court cases by CNR number',
    'Judgment Summarizer - AI-powered judgment summaries',
    'Legal Research - Search Indian laws and case laws',
    'Client CRM - Manage clients and appointments',
    'Legal News - Stay updated with legal developments',
    'Legal Notices - Generate professional legal notices'
  ],
  keywords: 'AI legal assistant, Indian law, legal tech, lawyer software, case tracker, document drafting',
  inLanguage: ['en', 'hi'],
  isAccessibleForFree: true,
  isFamilyFriendly: true
}

// Organization Schema
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LAW.AI',
  alternateName: 'LawAI India',
  url: 'https://lawai.in',
  description: 'India\'s #1 AI-powered legal technology platform for lawyers, advocates, and law firms',
  foundingDate: '2024',
  founder: {
    '@type': 'Person',
    name: 'Raghav Shah',
    url: 'https://ragspro.com',
    jobTitle: 'Founder & CEO'
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
    addressRegion: 'India'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'ragsproai@gmail.com',
    availableLanguage: ['English', 'Hindi']
  },
  sameAs: [
    'https://twitter.com/lawai_india',
    'https://linkedin.com/company/lawai-india',
    'https://facebook.com/lawai.india'
  ],
  slogan: 'AI-Powered Legal Excellence'
}

// WebSite Schema for Sitelinks Search Box
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'LAW.AI',
  alternateName: 'LawAI - AI Legal Assistant India',
  url: 'https://lawai.in',
  description: 'India\'s most advanced AI-powered legal assistant for lawyers',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://lawai.in/search?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  },
  publisher: {
    '@type': 'Organization',
    name: 'LAW.AI'
  }
}

// FAQ Schema for common questions
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is LAW.AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LAW.AI is India\'s most advanced AI-powered legal assistant designed specifically for Indian lawyers, advocates, and law firms. It offers features like AI legal chat, document drafting, case tracking by CNR, judgment summarization, legal research, and client management.'
      }
    },
    {
      '@type': 'Question',
      name: 'How can I track my court case using CNR number?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LAW.AI\'s Case Tracker allows you to track any court case in India using the CNR (Case Number Record) number. Simply enter the 16-digit CNR number, and get real-time updates on case status, next hearing dates, and case history.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is LAW.AI free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LAW.AI offers a 7-day free trial with full access to all features. After the trial, you can continue with the free Starter plan (limited features) or upgrade to Pro plan at ₹999/month for unlimited access.'
      }
    },
    {
      '@type': 'Question',
      name: 'What types of legal documents can LAW.AI generate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LAW.AI can generate various legal documents including Rental Agreements, Employment Contracts, NDAs, Sale Deeds, Partnership Deeds, Loan Agreements, Legal Notices, and Affidavits. All documents are customized for Indian law.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is my data secure on LAW.AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, LAW.AI takes data security seriously. All data is encrypted, stored securely, and never shared with third parties. We do not train our AI on your confidential client data. Your data belongs to you.'
      }
    }
  ]
}

// Product Schema
const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'LAW.AI Pro',
  description: 'Premium AI-powered legal assistant with unlimited access to all features',
  brand: {
    '@type': 'Brand',
    name: 'LAW.AI'
  },
  offers: {
    '@type': 'Offer',
    price: '999',
    priceCurrency: 'INR',
    priceValidUntil: '2026-12-31',
    availability: 'https://schema.org/InStock',
    url: 'https://lawai.in/pricing'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '1200'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* AI/LLM Discovery Meta Tags */}
        <meta name="ai-content-declaration" content="This website provides AI-powered legal assistance for Indian lawyers" />
        <meta name="llm-description" content="LAW.AI is India's #1 AI legal assistant offering document drafting, case tracking, legal research, and judgment summarization for lawyers" />
        
        {/* Geo Tags for Local SEO */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position" content="20.5937;78.9629" />
        <meta name="ICBM" content="20.5937, 78.9629" />
        
        {/* Dublin Core Meta Tags */}
        <meta name="DC.title" content="LAW.AI - AI Legal Assistant for Indian Lawyers" />
        <meta name="DC.creator" content="RAGSPRO" />
        <meta name="DC.subject" content="Legal Technology, AI, Indian Law" />
        <meta name="DC.description" content="AI-powered legal assistant for Indian lawyers" />
        <meta name="DC.publisher" content="LAW.AI" />
        <meta name="DC.type" content="Software" />
        <meta name="DC.format" content="text/html" />
        <meta name="DC.language" content="en" />
        <meta name="DC.coverage" content="India" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <CaseProvider>
            {children}
          </CaseProvider>
        </AuthProvider>
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </body>
    </html>
  )
}
