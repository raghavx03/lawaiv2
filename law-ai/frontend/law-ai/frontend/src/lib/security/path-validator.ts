import path from 'path'

const ALLOWED_PATHS = [
  '/tmp',
  '/uploads',
  '/public'
]

export function validatePath(filePath: string): boolean {
  const normalizedPath = path.normalize(filePath)
  
  if (normalizedPath.includes('..')) return false
  if (normalizedPath.includes('\0')) return false
  
  return ALLOWED_PATHS.some(allowed => 
    normalizedPath.startsWith(allowed)
  )
}

export function sanitizePath(filePath: string): string {
  return path.basename(filePath)
}