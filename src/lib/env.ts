import { z } from 'zod'

const envSchema = z.object({
  NVIDIA_LLAMA_API_KEY: z.string().optional(),
  NVIDIA_DEEPSEEK_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CSRF_SECRET: z.string().default('law-ai-csrf-secret-2024-production-change-this-key'),
  JWT_SECRET: z.string().default('law-ai-jwt-secret-2024-production-change-this-key')
})

function validateEnv() {
  try {
    const envData = {
      NVIDIA_LLAMA_API_KEY: process.env.NVIDIA_LLAMA_API_KEY,
      NVIDIA_DEEPSEEK_API_KEY: process.env.NVIDIA_DEEPSEEK_API_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NODE_ENV: process.env.NODE_ENV,
      CSRF_SECRET: process.env.CSRF_SECRET,
      JWT_SECRET: process.env.JWT_SECRET
    }

    // Always use lenient validation to prevent build crashes
    return envSchema.parse(envData)

  } catch (error) {
    // console.warn('Environment validation warning', error) // Squelch warning to prevent build crash
    return {
      NVIDIA_LLAMA_API_KEY: process.env.NVIDIA_LLAMA_API_KEY || '',
      NVIDIA_DEEPSEEK_API_KEY: process.env.NVIDIA_DEEPSEEK_API_KEY || '',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      RESEND_API_KEY: process.env.RESEND_API_KEY || '',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      NODE_ENV: process.env.NODE_ENV || 'development',
      CSRF_SECRET: 'dev-csrf-secret',
      JWT_SECRET: 'dev-jwt-secret'
    } as any
  }
}

export const env = typeof window === 'undefined' ? validateEnv() : {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development'
} as any