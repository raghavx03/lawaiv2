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
import { Eye, EyeOff, Mail, Lock, User, Scale, ArrowRight, Shield, Sparkles } from 'lucide-react'

function SignupForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabase()
      if (!supabase) {
        toast.error('System unavailable')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`
        }
      })

      if (error) {
        console.error('Signup error:', error)
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists')
        } else {
          toast.error(error.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        // Auto-login immediately — sign in with the credentials just used
        toast.success('Account created! Logging you in...')
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
          if (!signInError) {
            window.location.href = '/dashboard'
            return
          }
        } catch (e) {
          // If auto-login fails, still redirect
          console.warn('Auto-login after signup failed:', e)
        }
        // Fallback redirect
        window.location.href = '/dashboard'
      }
    } catch (error: any) {
      console.error('Signup exception:', error)
      toast.error('Signup failed. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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
        toast.error('Google signup failed: ' + error.message)
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Google signup exception:', error)
      toast.error('Google signup failed')
      setLoading(false)
    }
  }

  return (
    <div className={`w-full max-w-[420px] transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

      {/* Header / Brand (Mobile Only) */}
      <div className={`lg:hidden flex flex-col items-center text-center mb-8 transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
          <Scale className="w-6 h-6 text-black" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">LAW.AI</h1>
      </div>

      <div className="mb-8 hidden lg:block">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Create Account</h2>
        <p className="text-white/40 text-sm">Start your intelligent legal journey today</p>
      </div>

      {/* Main Glass Card */}
      <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden group">

        {/* Animated Glow Effect chasing the border */}
        <div className="absolute inset-0 rounded-[2rem] border border-transparent [background:linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)_border-box] [background-size:250%_250%,cover] animate-[bg-spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" style={{ WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'destination-out', maskComposite: 'exclude' }} />

        {/* Subtle top/left edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-10" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent z-10" />

        <form onSubmit={handleEmailSignup} className="relative z-20 space-y-4">
          {/* Full Name */}
          <div className="space-y-2 group/input">
            <Label htmlFor="fullName" className="text-sm font-medium text-white/70 group-focus-within/input:text-white transition-colors">Full Name</Label>
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 rounded-xl blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within/input:text-white transition-colors duration-300 z-10" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Ex: Ananya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="relative z-10 pl-11 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:bg-white/[0.08] transition-all duration-300 text-base"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2 group/input">
            <Label htmlFor="email" className="text-sm font-medium text-white/70 group-focus-within/input:text-white transition-colors">Email</Label>
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 rounded-xl blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within/input:text-white transition-colors duration-300 z-10" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative z-10 pl-11 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:bg-white/[0.08] transition-all duration-300 text-base"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-2 group/input">
              <Label htmlFor="password" className="text-sm font-medium text-white/70 group-focus-within/input:text-white transition-colors">Password</Label>
              <div className="relative">
                <div className="absolute inset-0 bg-white/5 rounded-xl blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within/input:text-white transition-colors duration-300 z-10" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative z-10 pl-11 pr-11 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:bg-white/[0.08] transition-all duration-300 text-base font-medium tracking-widest placeholder:tracking-normal"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors duration-300 z-20"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 group/input">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/70 group-focus-within/input:text-white transition-colors">Confirm</Label>
              <div className="relative">
                <div className="absolute inset-0 bg-white/5 rounded-xl blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within/input:text-white transition-colors duration-300 z-10" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="relative z-10 pl-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 rounded-xl focus:border-white/40 h-12 focus:ring-1 focus:ring-white/20 focus:bg-white/[0.08] transition-all duration-300 text-base font-medium tracking-widest placeholder:tracking-normal"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-13 mt-6 bg-white text-black font-bold text-base rounded-xl hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] group/btn relative overflow-hidden"
            disabled={loading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:scale-110 transition-all duration-300" />
                </>
              )}
            </span>
          </Button>
        </form>

        <div className="relative z-20">
          <div className="relative my-8 z-20">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-white/40 bg-[#0a0a0a] rounded-full backdrop-blur-3xl border border-white/5 py-1">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="relative z-20 w-full h-13 bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.08] hover:text-white hover:border-white/20 rounded-xl transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>

          <p className="relative z-20 text-center text-sm text-white/40 mt-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-white hover:text-white hover:underline transition-all duration-300 font-semibold underline-offset-4 decoration-white/30 hover:decoration-white">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function SignupLoading() {
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

export default function SignupPage() {
  const [mounted, setMounted] = useState(false)

  import('react').then(R => {
    R.useEffect(() => { setMounted(true) }, [])
  })

  return (
    <div className="min-h-screen flex bg-black overflow-hidden font-sans">

      {/* LEFT SIDE - MASSIVE BRANDING / "WOW" ANIMATIONS */}
      <div className="hidden lg:flex flex-col w-[55%] relative p-12 justify-between border-r border-white/5">
        {/* Background ambient light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.05),transparent_50%)]" />

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)'
        }} />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.3)]">
            <Scale className="w-7 h-7 text-black" />
          </div>
          <span className="text-4xl font-extrabold text-white tracking-tighter">LAW.AI</span>
        </div>

        {/* Center content — Floating cards/features */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-xl">
          <h2 className="text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6 animate-slide-in-left" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            Join India's most advanced<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
              Legal AI Platform
            </span>
          </h2>
          <p className="text-lg text-white/50 leading-relaxed mb-12 animate-slide-in-left" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            Draft documents, research case laws, track CNR statuses, and manage clients—all in one intelligent workspace powered by NVIDIA AI.
          </p>

          {/* Floating Feature Cards */}
          <div className="space-y-4">
            {[
              { icon: Shield, title: 'Bank-Grade Security', desc: '256-bit SSL encryption & private AI servers', delay: '300ms' },
              { icon: Sparkles, title: 'NVIDIA Hardware', desc: 'Powered by H100 GPUs for zero-latency responses', delay: '400ms' },
              { icon: Scale, title: 'Supreme Court Ready', desc: 'Trained on 10M+ Indian judgments & acts', delay: '500ms' },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-500 cursor-default animate-slide-in-left"
                style={{ animationDelay: feature.delay, animationFillMode: 'both' }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">{feature.title}</h4>
                  <p className="text-white/40 text-sm mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center gap-8 text-sm font-medium text-white/30 animate-fade-in" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
          <span>Trusted by 10,000+ Advocates</span>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <span>Made for India</span>
        </div>
      </div>

      {/* RIGHT SIDE - THE SIGNUP FORM */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-8 relative">

        {/* Orbs specific to the right side */}
        <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[0%] left-[-20%] w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />

        {/* Mobile Grid Overlay */}
        <div className="lg:hidden absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 w-full flex flex-col items-center">

          <Suspense fallback={<SignupLoading />}>
            <SignupForm />
          </Suspense>

          {/* Trust badges footer */}
          <div className={`flex items-center justify-center gap-6 mt-12 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 text-white/20">
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
          @keyframes bg-spin {
            to { --border-angle: 1turn; }
          }
          @property --border-angle {
            syntax: "<angle>";
            inherits: true;
            initial-value: 0turn;
          }
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  )
}
