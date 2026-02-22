'use client'

import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && !url.includes('placeholder') && !key.includes('placeholder'))
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance

  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured — running in dev mode without auth')
    return null
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseKey)

  return supabaseInstance
}

// For backward compatibility — lazy getter with null safety
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const instance = getSupabase()
    if (!instance) {
      // Return no-op functions for dev mode
      if (typeof prop === 'string') {
        return (..._args: any[]) => ({
          data: null,
          error: { message: 'Supabase not configured (dev mode)' }
        })
      }
      return undefined
    }
    return (instance as any)[prop]
  }
})
