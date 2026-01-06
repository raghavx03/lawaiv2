export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getRateLimitKey, getIPFromRequest } from '@/lib/rate-limit'
import { sanitizeForLog } from '@/lib/security/log-sanitizer'
import { sanitizeInput } from '@/lib/security/input-sanitizer'
import { sanitizePath } from '@/lib/security/path-validator'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getIPFromRequest(request)
    const rateLimitKey = getRateLimitKey(ip, 'contact')
    const isAllowed = await rateLimit({
      key: rateLimitKey,
      limit: 5, // 5 messages per hour
      window: 3600
    })

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again later.' },
        { status: 429 }
      )
    }

    const contactSchema = z.object({
      name: z.string().min(1).max(100),
      email: z.string().email().max(255),
      subject: z.string().min(1).max(200),
      message: z.string().min(1).max(2000)
    })

    const { name, email, subject, message } = contactSchema.parse(await request.json())
    
    const sanitizedName = sanitizeInput(name)
    const sanitizedSubject = sanitizeInput(subject)
    const sanitizedMessage = sanitizeInput(message)

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Contact Form Message</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
            <p><strong>Name:</strong> ${sanitizedName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${sanitizedSubject}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-top: 0;">Message</h2>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
              ${sanitizedMessage.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
            <p style="margin: 0; color: #1976d2; font-size: 14px;">
              <strong>Sent from:</strong> LAW-AI Contact Form<br>
              <strong>IP Address:</strong> ${ip}<br>
              <strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
        </div>
      </div>
    `

    // Log the contact form submission
    console.log('=== NEW CONTACT FORM SUBMISSION ===')
    console.log('Name:', sanitizedName)
    console.log('Email:', email)
    console.log('Subject:', sanitizedSubject)
    console.log('Message:', sanitizedMessage)
    console.log('IP:', ip)
    console.log('Timestamp:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))
    console.log('==================================')
    
    // Send email using Formspree (free service)
    try {
      const formspreeResponse = await fetch('https://formspree.io/f/xpwaqjqr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sanitizedName,
          email: email,
          subject: sanitizedSubject,
          message: `${sanitizedMessage}\n\n---\nContact Details:\nName: ${sanitizedName}\nEmail: ${email}\nIP: ${ip}\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
          _replyto: email,
          _subject: `LAW-AI Contact: ${sanitizedSubject}`
        })
      })
      
      if (formspreeResponse.ok) {
        console.log('Email sent successfully via Formspree to ragsproai@gmail.com')
      } else {
        console.log('Formspree failed, message logged locally')
      }
    } catch (emailError) {
      console.error('Email service failed:', sanitizeForLog(emailError))
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message received successfully! We will get back to you soon.' 
    })

  } catch (error) {
    console.error('Contact form error:', sanitizeForLog(error))
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}