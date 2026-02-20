'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth/client'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields')
      return
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    console.log('[SignUp] Attempting email sign up for:', email)
    setLoading(true)

    try {
      const { data, error } = await signUpWithEmail(email, password, fullName)

      if (error) {
        console.error('[SignUp] Sign up error:', error)
        
        // Handle specific error types
        const errorMessage = (error as any)?.message || 'Failed to create account'
        if (errorMessage.includes('User already registered')) {
          toast.error('An account with this email already exists')
        } else if (errorMessage.includes('Password should be')) {
          toast.error('Password does not meet requirements')
        } else if (errorMessage.includes('Invalid email')) {
          toast.error('Please enter a valid email address')
        } else {
          toast.error(errorMessage)
        }
        return
      }

      if (data?.user && !data?.session) {
        console.log('[SignUp] Account created, email confirmation required')
        toast.success('Please check your email to confirm your account!')
        // Don't redirect, stay on page for email confirmation
      } else if (data?.session) {
        console.log('[SignUp] Account created with immediate session')
        toast.success('Account created successfully!')
        router.push('/dashboard')
      } else {
        console.warn('[SignUp] Unexpected signup result')
        toast.success('Account created! Please check your email.')
      }
    } catch (error: any) {
      console.error('[SignUp] Unexpected error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    console.log('[SignUp] Attempting Google OAuth')
    
    try {
      const { error } = await signInWithGoogle()

      if (error) {
        console.error('[SignUp] Google OAuth error:', error)
        toast.error((error as any)?.message || 'Failed to sign up with Google')
      }
      // If successful, user will be redirected by OAuth flow
    } catch (error: any) {
      console.error('[SignUp] Google OAuth unexpected error:', error)
      toast.error('Google sign up failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">⚖</span>
          </div>
          <CardTitle className="text-2xl font-bold">Create account</CardTitle>
          <p className="text-gray-600">Get started with LAW.AI today</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>
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
                placeholder="Create a password"
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-2">
                <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗'}</div>
                <div>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗'}</div>
              </div>
            )}
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
            onClick={handleGoogleSignUp}
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
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}