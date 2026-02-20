'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { signInWithEmail, signInWithGoogle } from '@/lib/auth/client'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      console.error('Auth error from URL:', error)
      if (error === 'auth_failed') {
        toast.error('Authentication failed. Please try again.')
      } else if (error === 'server_error') {
        toast.error('Server error occurred. Please try again.')
      }
    }
  }, [searchParams])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    
    console.log('[SignIn] Attempting email sign in for:', email)
    setLoading(true)

    try {
      const { data, error } = await signInWithEmail(email, password)

      if (error) {
        console.error('[SignIn] Sign in error:', error)
        
        const errorMessage = (error as any)?.message || 'Failed to sign in'
        if (errorMessage.includes('Invalid login credentials')) {
          toast.error('Invalid email or password')
        } else if (errorMessage.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account')
        } else if (errorMessage.includes('Too many requests')) {
          toast.error('Too many attempts. Please wait before trying again.')
        } else {
          toast.error(errorMessage)
        }
        return
      }

      if (data?.session) {
        console.log('[SignIn] Sign in successful, redirecting to dashboard')
        toast.success('Signed in successfully!')
        
        const redirectTo = searchParams.get('redirectTo') || '/dashboard'
        router.push(redirectTo)
      } else {
        console.warn('[SignIn] No session returned')
        toast.error('Sign in failed - no session created')
      }
    } catch (error: any) {
      console.error('[SignIn] Unexpected error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    console.log('[SignIn] Attempting Google OAuth')
    
    try {
      const { error } = await signInWithGoogle()

      if (error) {
        console.error('[SignIn] Google OAuth error:', error)
        toast.error((error as any)?.message || 'Failed to sign in with Google')
      }
    } catch (error: any) {
      console.error('[SignIn] Google OAuth unexpected error:', error)
      toast.error('Google sign in failed')
    }
  }

  return (
    <Card className="w-full max-w-md bg-white border-gray-200">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
          <span className="text-white text-xl font-bold">⚖</span>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
        <p className="text-gray-600">Sign in to your LAW-AI account</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="text-center text-sm">
          <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Forgot your password?
          </Link>
        </div>

        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function SignInLoading() {
  return (
    <Card className="w-full max-w-md bg-white border-gray-200">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
        <p className="text-gray-600">Loading...</p>
      </CardHeader>
    </Card>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Suspense fallback={<SignInLoading />}>
        <SignInForm />
      </Suspense>
    </div>
  )
}
