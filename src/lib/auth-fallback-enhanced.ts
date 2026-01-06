'use client'

// Enhanced fallback authentication system
interface FallbackUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    name?: string
    avatar_url?: string
    picture?: string
  }
}

interface FallbackSession {
  user: FallbackUser
  access_token: string
  expires_at: number
}

class FallbackAuth {
  private session: FallbackSession | null = null
  private listeners: ((session: FallbackSession | null) => void)[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSession()
    }
  }

  private loadSession() {
    try {
      const stored = localStorage.getItem('fallback_auth_session')
      if (stored) {
        const session = JSON.parse(stored)
        if (session.expires_at > Date.now()) {
          this.session = session
        } else {
          localStorage.removeItem('fallback_auth_session')
        }
      }
    } catch (error) {
      console.warn('Failed to load fallback session:', error)
    }
  }

  private saveSession(session: FallbackSession | null) {
    try {
      if (session) {
        localStorage.setItem('fallback_auth_session', JSON.stringify(session))
      } else {
        localStorage.removeItem('fallback_auth_session')
      }
    } catch (error) {
      console.warn('Failed to save fallback session:', error)
    }
  }

  async signInWithPassword(email: string, password: string) {
    // Simulate authentication - in production, this would call your backend
    if (email && password) {
      const user: FallbackUser = {
        id: `fallback_${Date.now()}`,
        email,
        user_metadata: {
          full_name: email.split('@')[0],
          name: email.split('@')[0]
        }
      }

      const session: FallbackSession = {
        user,
        access_token: `fallback_token_${Date.now()}`,
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }

      this.session = session
      this.saveSession(session)
      this.notifyListeners()

      return { data: { user, session }, error: null }
    }

    return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } }
  }

  async signInWithOAuth(options: { provider: string; options?: any }) {
    // For fallback, we'll simulate OAuth success
    const user: FallbackUser = {
      id: `fallback_oauth_${Date.now()}`,
      email: 'demo@law-ai.com',
      user_metadata: {
        full_name: 'Demo User',
        name: 'Demo User',
        avatar_url: 'https://via.placeholder.com/150'
      }
    }

    const session: FallbackSession = {
      user,
      access_token: `fallback_oauth_token_${Date.now()}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000)
    }

    this.session = session
    this.saveSession(session)
    this.notifyListeners()

    // Simulate redirect
    setTimeout(() => {
      window.location.replace('/dashboard')
    }, 100)

    return { data: { user, session }, error: null }
  }

  async getSession() {
    return { data: { session: this.session }, error: null }
  }

  async getUser() {
    return { data: { user: this.session?.user || null }, error: null }
  }

  async signOut() {
    this.session = null
    this.saveSession(null)
    this.notifyListeners()
    return { error: null }
  }

  onAuthStateChange(callback: (event: string, session: FallbackSession | null) => void) {
    const wrappedCallback = (session: FallbackSession | null) => {
      const event = session ? 'SIGNED_IN' : 'SIGNED_OUT'
      callback(event, session)
    }
    
    this.listeners.push(wrappedCallback)
    
    // Immediately call with current state
    wrappedCallback(this.session)

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(wrappedCallback)
            if (index > -1) {
              this.listeners.splice(index, 1)
            }
          }
        }
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.session))
  }
}

export const fallbackAuth = new FallbackAuth()