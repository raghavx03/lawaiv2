export function sanitizeForLog(input: any): string {
  if (input === null || input === undefined) return 'null'
  
  let str = typeof input === 'string' ? input : JSON.stringify(input)
  
  return str
    .replace(/[\r\n\t\x00-\x1f\x7f-\x9f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500)
}

export function sanitizeError(error: any): string {
  if (error instanceof Error) {
    return sanitizeForLog(error.message)
  }
  return sanitizeForLog(String(error))
}