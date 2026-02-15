'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'
import { getAvatarUrl } from '@/lib/avatar'

interface UserProfile {
  userId: string
  email: string
  fullName?: string
  phone?: string
  organization?: string
  profilePic?: string
  plan: 'FREE' | 'BASIC' | 'PLUS' | 'PRO'
  usageCount: number
  expiryDate?: Date | undefined
  trialEndDate?: Date | undefined
  createdAt?: Date | undefined
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  profileLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isDevMode: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && !url.includes('placeholder') && !url.includes('your_') && !key.includes('placeholder'))
}

// Dev mode user
const DEV_USER: User = {
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
  created_at: new Date().toISOString(),
} as any

const DEV_PROFILE: UserProfile = {
  userId: 'dev-user-001',
  email: 'demo@lawai.com',
  fullName: 'Demo Lawyer',
  plan: 'PRO',
  usageCount: 0,
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [isDevMode] = useState(!isSupabaseConfigured())

  const createProfileFromUser = (user: User): UserProfile => {
    const isAdmin = user.email === 'shivangibabbar0211@gmail.com'
    return {
      userId: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
      profilePic: getAvatarUrl(user, null) || undefined,
      plan: isAdmin ? 'PRO' : 'FREE',
      usageCount: 0
    }
  }

  const refreshProfile = async () => {
    if (isDevMode) {
      setProfile(DEV_PROFILE)
      return
    }

    if (!user) {
      setProfile(null)
      return
    }

    setProfileLoading(true)

    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        }
      })

      if (response.ok) {
        const data = await response.json()
        const profileData = data.profile || data

        const newProfile: UserProfile = {
          userId: profileData.id || user.id,
          email: profileData.email || user.email || '',
          fullName: profileData.fullName || user.user_metadata?.full_name || user.user_metadata?.name || undefined,
          profilePic: profileData.profilePic || user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
          plan: (profileData.plan || (user.email === 'shivangibabbar0211@gmail.com' ? 'PRO' : 'FREE')) as 'FREE' | 'BASIC' | 'PLUS' | 'PRO',
          usageCount: profileData.usageCount || 0,
          expiryDate: profileData.expiryDate ? new Date(profileData.expiryDate) : undefined,
          trialEndDate: profileData.trialEndDate ? new Date(profileData.trialEndDate) : undefined,
          createdAt: profileData.createdAt ? new Date(profileData.createdAt) : undefined
        }

        setProfile(newProfile)
      } else {
        setProfile(createProfileFromUser(user))
      }
    } catch (error) {
      setProfile(createProfileFromUser(user))
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    // DEV MODE: Auto-login with demo user
    if (isDevMode) {
      setUser(DEV_USER)
      setProfile(DEV_PROFILE)
      setLoading(false)
      return
    }

    // PRODUCTION: Normal Supabase auth
    const initAuth = async () => {
      try {
        const supabase = getSupabase()
        const { data: { session } } = await supabase.auth.getSession()

        if (mounted) {
          setUser(session?.user ?? null)

          if (session?.user) {
            const immediateProfile = createProfileFromUser(session.user)
            setProfile(immediateProfile)
            refreshProfile()
          } else {
            setProfile(null)
          }

          setLoading(false)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return

            setUser(session?.user ?? null)

            if (session?.user) {
              const immediateProfile = createProfileFromUser(session.user)
              setProfile(immediateProfile)
              refreshProfile()
            } else {
              setProfile(null)
            }

            setLoading(false)
          }
        )

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Auth init error:', error)
        if (mounted) {
          // Fallback to dev mode if Supabase fails
          setUser(DEV_USER)
          setProfile(DEV_PROFILE)
          setLoading(false)
        }
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

  const signInWithGoogle = async () => {
    if (isDevMode) {
      // In dev mode, just set user
      setUser(DEV_USER)
      setProfile(DEV_PROFILE)
      window.location.href = '/dashboard'
      return
    }
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (isDevMode) {
      setUser(null)
      setProfile(null)
      window.location.href = '/'
      return
    }
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()

      setUser(null)
      setProfile(null)

      localStorage.clear()
      sessionStorage.clear()

      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      setUser(null)
      setProfile(null)
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      profileLoading,
      signInWithGoogle,
      signOut,
      refreshProfile,
      isDevMode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}