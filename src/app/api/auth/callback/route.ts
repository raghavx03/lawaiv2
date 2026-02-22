import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeForLog, sanitizeInput } from '@/lib/security/input-sanitizer-enhanced'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log('[AuthCallback] Processing auth callback')

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const next = searchParams.get('next') ?? '/dashboard'

    console.log('[AuthCallback] Code present:', !!code)
    console.log('[AuthCallback] Error present:', !!error)

    // Handle OAuth errors
    if (error) {
      console.error('[AuthCallback] OAuth error:', sanitizeForLog(error), sanitizeForLog(errorDescription || ''))
      return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(sanitizeInput(error))}`, request.url))
    }

    if (!code) {
      console.error('[AuthCallback] No code provided')
      return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url))
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options as any)
              })
            } catch (e) {
              // Ignore cookie set errors in server component/route handlers
            }
          },
        },
      }
    )

    console.log('[AuthCallback] Exchanging code for session')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[AuthCallback] Exchange error:', sanitizeForLog(exchangeError))
      return NextResponse.redirect(new URL(`/auth/login?error=auth_failed&message=${encodeURIComponent(sanitizeInput(exchangeError.message))}`, request.url))
    }

    if (!data.session || !data.user) {
      console.error('[AuthCallback] No session or user returned')
      return NextResponse.redirect(new URL('/auth/login?error=no_session', request.url))
    }

    console.log('[AuthCallback] Session created successfully for user:', sanitizeForLog(data.user.email))

    try {
      // Try to create/update user profile in database
      const { safeDbOperation } = await import('@/lib/prisma')
      await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) throw new Error('Database unavailable')

        const userProfile = await prisma.userApp.upsert({
          where: { userId: data.user.id },
          update: {
            email: data.user.email!,
            fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            profilePic: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
          },
          create: {
            userId: data.user.id,
            email: data.user.email!,
            fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            profilePic: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            plan: 'FREE',
            usageCount: 0
          }
        })

        console.log('[AuthCallback] User profile created/updated successfully:', sanitizeForLog(userProfile.email))
        return userProfile
      }, null)
    } catch (dbError) {
      console.warn('[AuthCallback] Database unavailable, user will use fallback auth:', sanitizeForLog((dbError as Error)?.message || 'Unknown error'))
      // Continue with redirect - user can still access the app with fallback auth
    }

    const sanitizedNext = next && next.startsWith('/') && !next.includes('..') && !next.includes('<') && !next.includes('>') ? sanitizeInput(next) : '/dashboard'
    console.log('[AuthCallback] Redirecting to:', sanitizeForLog(sanitizedNext))

    // Create redirect response with history replacement to avoid Google OAuth in browser history
    const redirectUrl = new URL(sanitizedNext, request.url)
    const response = NextResponse.redirect(redirectUrl)

    // Add header to indicate this should replace history entry
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')

    return response
  } catch (error) {
    console.error('[AuthCallback] Critical error:', sanitizeForLog(error))
    return NextResponse.redirect(new URL('/auth/login?error=server_error', request.url))
  }
}