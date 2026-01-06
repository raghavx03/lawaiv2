// Enhanced input sanitization with comprehensive security
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  return input
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove data: protocol (except safe data URLs)
    .replace(/data:(?!image\/(png|jpg|jpeg|gif|svg\+xml))[^;]*/gi, '')
    // Remove vbscript: protocol
    .replace(/vbscript:/gi, '')
    // Remove expression() CSS
    .replace(/expression\s*\(/gi, '')
    // Remove import statements
    .replace(/@import/gi, '')
    // Trim whitespace
    .trim()
    // Limit length
    .substring(0, 1000)
}

export function sanitizeForLog(input: any): string {
  if (!input) return ''
  
  const str = typeof input === 'string' ? input : JSON.stringify(input)
  
  return str
    // Remove newlines and tabs that could break log format
    .replace(/\r?\n/g, ' ')
    .replace(/\t/g, ' ')
    // Remove potential log injection characters
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    // Limit length for logs
    .substring(0, 1000)
}