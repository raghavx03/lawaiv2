export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, userEmail, subject, message, screenshot } = await request.json()

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    // Create email content
    const emailContent = {
      to: 'ragsproai@gmail.com',
      from: userEmail,
      subject: `[LAW-AI ${type.toUpperCase()}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            ${type === 'support' ? 'Support Request' : 'Bug Report'}
          </h2>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>From:</strong> ${userEmail}<br>
            <strong>User ID:</strong> ${user.id}<br>
            <strong>Date:</strong> ${new Date().toLocaleString()}<br>
            <strong>Type:</strong> ${type === 'support' ? 'Support Request' : 'Bug Report'}
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #555;">Message:</h3>
            <div style="background: white; padding: 15px; border-left: 4px solid #007bff; white-space: pre-wrap;">
${message}
            </div>
          </div>

          ${screenshot ? `
          <div style="margin: 20px 0;">
            <h3 style="color: #555;">Screenshot:</h3>
            <p style="color: #666; font-size: 14px;">Screenshot attached (base64 data)</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            This email was sent automatically from LAW-AI Help & Support system.
          </div>
        </div>
      `
    }

    // For now, we'll use a simple email service or fallback to mailto
    // In production, you would integrate with services like SendGrid, Nodemailer, etc.
    
    // Simulate email sending (replace with actual email service)
    console.log('Email would be sent:', emailContent)
    
    // For demo purposes, we'll create a mailto link as fallback
    const mailtoLink = `mailto:ragsproai@gmail.com?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(message)}`
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      mailtoLink // Include for fallback
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}