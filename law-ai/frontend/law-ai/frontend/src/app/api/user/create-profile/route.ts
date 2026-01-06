export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'

export async function POST() {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User profile is automatically created in getServerUser, just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Profile ready',
      profile: user
    })
  } catch (error) {
    console.error('Profile creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}