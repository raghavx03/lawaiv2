// Security utilities for LAW-AI dashboard
import DOMPurify from 'isomorphic-dompurify'

// URL validation for preventing open redirects
export function isValidUrl(url: string): boolean {
  if (!url || url === '#') return false
  
  try {
    const urlObj = new URL(url)
    // Only allow https URLs from trusted domains
    const trustedDomains = [
      'law.ai',
      'legal-news.com',
      'indiankanoon.org',
      'manupatra.com',
      'scconline.com'
    ]
    
    return urlObj.protocol === 'https:' && 
           trustedDomains.some(domain => urlObj.hostname.endsWith(domain))
  } catch {
    return false
  }
}

// Sanitize text content to prevent XSS
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

// Sanitize HTML content with limited tags
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'span'],
    ALLOWED_ATTR: []
  })
}

// Generate secure random ID
export function generateSecureId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

// Validate date strings to prevent date-fns errors
export function isValidDateString(dateStr: string): boolean {
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}