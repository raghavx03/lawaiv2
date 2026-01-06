export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { createGuardedHandler } from '@/lib/security/guards'

export const POST = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    try {
      // Create redirect response to landing page
      const response = NextResponse.redirect(new URL('/', request.url))

      // Clear all possible auth cookies with multiple domain variations
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token', 
        'supabase-auth-token',
        'supabase.auth.token',
        'sb-auth-token',
        'auth-token',
        'session',
        'next-auth.session-token',
        'next-auth.csrf-token'
      ]
      
      cookiesToClear.forEach(cookieName => {
        // Clear for root path
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: '/',
          httpOnly: false
        })
        
        // Clear for all paths
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: '/',
          domain: undefined,
          httpOnly: false
        })
      })
      
      // Set cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      
      return response
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, clear cookies and redirect to landing
      const response = NextResponse.redirect(new URL('/', request.url))
      
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token', 
        'supabase-auth-token',
        'supabase.auth.token',
        'sb-auth-token',
        'auth-token',
        'session'
      ]
      
      cookiesToClear.forEach(cookieName => {
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: '/'
        })
      })
      
      return response
    }
  },
  { requireAuth: false, requireCSRF: false }
)