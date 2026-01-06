import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET() {
  try {
    // Generate a simple CSRF token
    const token = randomBytes(32).toString('hex')
    
    return NextResponse.json({ 
      token,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}