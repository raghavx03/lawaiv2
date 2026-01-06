import DOMPurify from 'isomorphic-dompurify'

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  // Length limit for security
  if (input.length > 10000) {
    input = input.substring(0, 10000)
  }
  
  // Remove potential XSS vectors
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    FORBID_CONTENTS: ['script', 'style'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed']
  }).trim()
}

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return ''
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  })
}

export function sanitizeForLog(input: any): string {
  if (typeof input !== 'string') {
    input = JSON.stringify(input)
  }
  
  // Remove newlines and control characters for log injection prevention
  return input.replace(/[\r\n\t\x00-\x1f\x7f-\x9f]/g, ' ').substring(0, 1000)
}