import { createBrowserClient } from '@supabase/ssr'
import { sanitizeForLog } from '@/lib/security/log-sanitizer'

// Use fallback values if environment variables are placeholders or missing
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseUrl = (url && !url.includes('your_') && url !== 'placeholder') ? url : 'https://hudflljbqezmpibippyb.supabase.co'
const supabaseKey = (key && !key.includes('your_')) ? key : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGZsbGpicWV6bXBpYmlwcHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MzE4NzQsImV4cCI6MjA1MDEwNzg3NH0.Ky_7Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export { supabase }

export async function getSessionClient() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Client session error:', sanitizeForLog(error))
      return null
    }
    return session
  } catch (error) {
    console.error('Failed to get client session:', sanitizeForLog(error))
    return null
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', sanitizeForLog(error))
      throw error
    }

    console.log('Sign in successful:', sanitizeForLog(data.user?.email))
    return { data, error: null }
  } catch (error) {
    console.error('Sign in failed:', sanitizeForLog(error))
    return { data: null, error }
  }
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) {
      console.error('Sign up error:', sanitizeForLog(error))
      throw error
    }

    console.log('Sign up result:', sanitizeForLog({
      user: data.user?.email,
      session: !!data.session,
      needsConfirmation: !data.session && data.user
    }))

    return { data, error: null }
  } catch (error) {
    console.error('Sign up failed:', sanitizeForLog(error))
    return { data: null, error }
  }
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`
      }
    })

    if (error) {
      console.error('Google OAuth error:', sanitizeForLog(error))
      throw error
    }

    console.log('Google OAuth initiated')
    return { data, error: null }
  } catch (error) {
    console.error('Google OAuth failed:', sanitizeForLog(error))
    return { data: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', sanitizeForLog(error))
      throw error
    }
    console.log('Sign out successful')
    return { error: null }
  } catch (error) {
    console.error('Sign out failed:', sanitizeForLog(error))
    return { error }
  }
}