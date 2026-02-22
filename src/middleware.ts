import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response that we can modify
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, skip auth checks
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    return response
  }

  // Create Supabase client with cookie handling
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({
          request: { headers: request.headers },
        })
        // Re-apply security headers after creating new response
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-XSS-Protection', '1; mode=block')
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) =>
          response.cookies.set(name, value, options as any)
        )
      },
    },
  })

  // Refresh the session (this also refreshes expired tokens)
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected routes — redirect to login if not authenticated
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/ai-assistant') ||
    pathname.startsWith('/voice-lawyer') ||
    pathname.startsWith('/drafts') ||
    pathname.startsWith('/summarizer') ||
    pathname.startsWith('/case-tracker') ||
    pathname.startsWith('/crm') ||
    pathname.startsWith('/news') ||
    pathname.startsWith('/acts') ||
    pathname.startsWith('/notices') ||
    pathname.startsWith('/research') ||
    pathname.startsWith('/cases')

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Auth pages — redirect to dashboard if already logged in
  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}