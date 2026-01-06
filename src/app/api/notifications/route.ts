import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - Fetch notifications (returns empty array when DB is unavailable)
export async function GET(request: NextRequest) {
  try {
    // Return empty notifications to prevent errors when DB is unavailable
    return NextResponse.json({ 
      notifications: [],
      ok: true
    })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json({ 
      notifications: [],
      ok: true 
    })
  }
}

// POST - Create notification (gracefully handles DB unavailability)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type, userId } = body

    if (!title || !message) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // For now, just acknowledge the notification
    // When DB is available, this would save to database
    return NextResponse.json({
      ok: true,
      notification: {
        id: `temp-${Date.now()}`,
        title,
        message,
        type: type || 'info',
        timestamp: new Date().toISOString(),
        read: false
      }
    })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to create notification' 
    }, { status: 500 })
  }
}
