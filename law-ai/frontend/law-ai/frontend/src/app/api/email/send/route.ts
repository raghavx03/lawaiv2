export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json()

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Resend API implementation
    if (env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: env.FROM_EMAIL || 'noreply@yourdomain.com',
          to: Array.isArray(to) ? to : [to],
          subject,
          html: html || text,
          text
        })
      })

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.statusText}`)
      }

      const result = await response.json()
      return NextResponse.json({ success: true, id: result.id })
    }

    // Fallback: Log email (development mode)
    console.log('Email would be sent:', { to, subject, html: html?.substring(0, 100) })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email logged (no service configured)',
      id: `dev_${Date.now()}`
    })

  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}