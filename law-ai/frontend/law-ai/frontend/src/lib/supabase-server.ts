import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Server-side Supabase client
export const createServerSupabaseClient = async () => {
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Use fallback values if environment variables are placeholders or missing
  const supabaseUrl = (url && !url.includes('your_')) ? url : 'https://hudflljbqezmpibippyb.supabase.co'
  const supabaseKey = (key && !key.includes('your_')) ? key : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGZsbGpicWV6bXBpYmlwcHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MzE4NzQsImV4cCI6MjA1MDEwNzg3NH0.Ky_7Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}