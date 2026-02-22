'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, Scale, ArrowRight, Shield, Sparkles } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (error) {
      toast.error('Authentication error: Please try again')
    }

    if (message) {
      toast.success(message)
    }
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getSupabase()
      if (!supabase) {
        toast.error('System unavailable')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('Login error:', error)
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email first')
        } else {
          toast.error(error.message)
        }
        setLoading(false)
        return
      }

      if (data?.user) {
        toast.success('Login successful!')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 300)
      }
    } catch (error: any) {
      console.error('Login exception:', error)
      toast.error('Login failed. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      if (!supabase) {
        toast.error('System unavailable')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`
        }
      })

      if (error) {
        console.error('Google OAuth error:', error)
        toast.error('Google login failed: ' + error.message)
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Google login exception:', error)
      toast.error('Google login failed')
      setLoading(false)
    }
  }

  return (
    <div className={`w-full max-w-md transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Card */}
      <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]">
        {/* Subtle top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-3xl" />

        <form onSubmit={handleEmailLogin} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-white/70">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-white/60 transition-colors duration-300" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 rounded-xl focus:border-white/30 focus:ring-1 focus:ring-white/10 focus:bg-white/[0.06] transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-white/70">Password</Label>
              <Link href="/auth/forgot-password" className="text-xs text-white/40 hover:text-white/70 transition-colors duration-300">
                Forgot?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-white/60 transition-colors duration-300" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 rounded-xl focus:border-white/30 focus:ring-1 focus:ring-white/10 focus:bg-white/[0.06] transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors duration-300 z-20"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] group relative overflow-hidden"
            disabled={loading}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                </>
              )}
            </span>
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-[11px] uppercase tracking-[0.15em] text-white/25 bg-transparent">or</span>
          </div>
        </div>

        {/* Google Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-12 bg-white/[0.03] border-white/[0.08] text-white/80 hover:bg-white/[0.06] hover:text-white hover:border-white/[0.15] rounded-xl transition-all duration-300 group"
        >
          <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>

        {/* Bottom Link */}
        <p className="text-center text-sm text-white/30 mt-7">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-white/70 hover:text-white transition-colors duration-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-10">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span className="text-white/40 text-sm">Loading...</span>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-black overflow-hidden">

      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-white/[0.01] rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Header / Brand */}
        <div className={`text-center mb-10 transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <Scale className="w-5 h-5 text-black" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-white/30 text-sm">
            Sign in to your LAW.AI account
          </p>
        </div>

        <Suspense fallback={<LoginLoading />}>
          <LoginForm />
        </Suspense>

        {/* Trust badges */}
        <div className={`flex items-center justify-center gap-6 mt-10 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-1.5 text-white/20">
            <Shield className="w-3 h-3" />
            <span className="text-[11px] tracking-wide">256-bit SSL</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5 text-white/20">
            <Sparkles className="w-3 h-3" />
            <span className="text-[11px] tracking-wide">AI Powered</span>
          </div>
        </div>
      </div>

      {/* Global animations */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
