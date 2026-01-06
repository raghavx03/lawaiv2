// Analytics utility
// Supports Google Analytics, Plausible, or custom analytics

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    plausible?: (...args: any[]) => void
  }
}

interface AnalyticsEvent {
  action: string
  category?: string
  label?: string
  value?: number
  [key: string]: any
}

class Analytics {
  private static instance: Analytics
  private isInitialized = false

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return
    this.isInitialized = true
    console.log('Analytics initialized')
  }

  // Track page views
  pageView(url: string, title?: string) {
    if (typeof window === 'undefined') return

    // Google Analytics
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX', {
        page_path: url,
        page_title: title
      })
    }

    // Plausible
    if (window.plausible) {
      window.plausible('pageview')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Page View:', url, title)
    }
  }

  // Track custom events
  event(eventData: AnalyticsEvent) {
    if (typeof window === 'undefined') return

    const { action, category, label, value, ...rest } = eventData

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...rest
      })
    }

    // Plausible
    if (window.plausible) {
      window.plausible(action, { props: { category, label, value, ...rest } })
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Event:', eventData)
    }
  }

  // Track user sign up
  signUp(method: string = 'email') {
    this.event({
      action: 'sign_up',
      category: 'engagement',
      label: method
    })
  }

  // Track user login
  login(method: string = 'email') {
    this.event({
      action: 'login',
      category: 'engagement',
      label: method
    })
  }

  // Track feature usage
  featureUsed(featureName: string, details?: Record<string, any>) {
    this.event({
      action: 'feature_used',
      category: 'features',
      label: featureName,
      ...details
    })
  }

  // Track document generation
  documentGenerated(documentType: string) {
    this.event({
      action: 'document_generated',
      category: 'documents',
      label: documentType
    })
  }

  // Track AI usage
  aiUsed(feature: string, tokensUsed?: number) {
    this.event({
      action: 'ai_used',
      category: 'ai',
      label: feature,
      value: tokensUsed
    })
  }

  // Track search
  search(query: string, resultsCount?: number) {
    this.event({
      action: 'search',
      category: 'engagement',
      label: query,
      value: resultsCount
    })
  }

  // Track conversion events
  startTrial() {
    this.event({
      action: 'start_trial',
      category: 'conversion'
    })
  }

  subscribe(plan: string, value?: number) {
    this.event({
      action: 'subscribe',
      category: 'conversion',
      label: plan,
      value
    })
  }

  // Track errors
  error(errorType: string, errorMessage: string) {
    this.event({
      action: 'error',
      category: 'errors',
      label: `${errorType}: ${errorMessage}`
    })
  }

  // Set user properties
  setUserId(userId: string) {
    if (typeof window === 'undefined') return

    if (window.gtag) {
      window.gtag('set', { user_id: userId })
    }
  }

  setUserProperties(properties: Record<string, any>) {
    if (typeof window === 'undefined') return

    if (window.gtag) {
      window.gtag('set', 'user_properties', properties)
    }
  }
}

export const analytics = Analytics.getInstance()

// React hook for analytics
export function useAnalytics() {
  return {
    trackPageView: (url: string, title?: string) => analytics.pageView(url, title),
    trackEvent: (event: AnalyticsEvent) => analytics.event(event),
    trackFeature: (feature: string) => analytics.featureUsed(feature),
    trackDocument: (type: string) => analytics.documentGenerated(type),
    trackAI: (feature: string) => analytics.aiUsed(feature),
    trackSearch: (query: string) => analytics.search(query),
    trackError: (type: string, message: string) => analytics.error(type, message)
  }
}
