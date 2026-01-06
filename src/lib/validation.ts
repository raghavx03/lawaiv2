import { z } from 'zod'

// Sanitize user input (server-safe)
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Server-safe sanitization without DOMPurify
  return input
    .trim()
    .replace(/[<>"']/g, '') // Remove basic XSS chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/\$\{.*\}/g, '') // Remove template literals
    .substring(0, 10000) // Limit length
}

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

// Payment schemas
export const paymentSchema = z.object({
  plan: z.enum(['BASIC', 'PLUS', 'PRO']),
})

export const paymentVerificationSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
})

// AI schemas
export const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().uuid().optional(),
})

export const summarizerSchema = z.object({
  text: z.string().min(10).max(50000),
  title: z.string().min(1).max(200),
})

export const draftSchema = z.object({
  type: z.enum(['rent', 'sale', 'partnership', 'employment', 'nda']),
  inputs: z.record(z.string()),
})

// Research schema
export const researchSchema = z.object({
  query: z.string().min(1).max(500),
  type: z.enum(['general', 'ipc', 'crpc', 'case_law']).default('general'),
})

// Case tracker schema
export const caseTrackerSchema = z.object({
  cnr: z.string().min(1).max(50),
  partyName: z.string().min(1).max(200),
})

// Notice schema
export const noticeSchema = z.object({
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  recipient: z.string().min(1).max(200),
  content: z.string().min(10).max(5000),
})

// CRM schema
export const crmSchema = z.object({
  clientName: z.string().min(1).max(100),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  date: z.string().datetime(),
  duration: z.number().min(15).max(480).default(60),
})