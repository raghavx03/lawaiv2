'use client'

let csrfToken: string | null = null

export function getCSRFToken(): string | null {
  if (typeof window === 'undefined') return null
  
  if (!csrfToken) {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf-token='))
    
    if (cookie) {
      const value = cookie.split('=')[1]
      if (value) {
        csrfToken = value.split('.')[0] || null // Extract token part before signature
      }
    }
  }
  
  return csrfToken
}

export function addCSRFHeader(headers: Record<string, string> = {}): Record<string, string> {
  const token = getCSRFToken()
  if (token) {
    headers['x-csrf-token'] = token
  }
  return headers
}

export async function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = addCSRFHeader(options.headers as Record<string, string> || {})
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  })
}