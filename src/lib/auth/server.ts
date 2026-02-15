import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && !url.includes('placeholder') && !url.includes('your_') && !key.includes('placeholder'))
}

// Dev mode user — returned when Supabase is not configured
function getDevUser() {
  return {
    id: 'dev-user-001',
    email: 'demo@lawai.com',
    user_metadata: {
      full_name: 'Demo Lawyer',
      plan: 'PRO',
      avatar_url: null
    },
    app_metadata: {},
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString()
  }
}

function getDevSession() {
  const user = getDevUser()
  return {
    access_token: 'dev-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'dev-refresh',
    user,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  }
}

export async function getSessionServer() {
  try {
    // Dev mode fallback
    if (!isSupabaseConfigured()) {
      return getDevSession()
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (e) {
              // Ignore in middleware
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (e) {
              // Ignore in middleware
            }
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Server session error:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Failed to get server session:', error)
    return null
  }
}

export async function getSessionFromRequest(request: NextRequest) {
  try {
    // Dev mode fallback
    if (!isSupabaseConfigured()) {
      return getDevSession()
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Request session error:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Failed to get session from request:', error)
    return null
  }
}

export async function getServerUser() {
  try {
    const session = await getSessionServer()
    return session?.user || null
  } catch (error) {
    console.error('Failed to get server user:', error)
    return null
  }
}

export async function createServerSupabaseClient() {
  // Dev mode: return a mock client
  if (!isSupabaseConfigured()) {
    // Return a minimal mock that won't crash
    return {
      auth: {
        getUser: async () => ({ data: { user: getDevUser() }, error: null }),
        getSession: async () => ({ data: { session: getDevSession() }, error: null }),
      }
    } as any
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (e) {
            // Ignore in middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (e) {
            // Ignore in middleware
          }
        },
      },
    }
  )
}
