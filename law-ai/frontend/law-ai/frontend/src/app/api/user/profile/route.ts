import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { safeDbOperation } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Extract user ID from auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ ok: false, message: 'Invalid session' }, { status: 401 })
    }

    // Get user profile from database
    const userProfile = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')
      
      return await prisma.userApp.findUnique({
        where: { userId: user.id },
        select: {
          userId: true,
          plan: true,
          usageCount: true,
          expiryDate: true
        }
      })
    }, null)

    // If no profile exists, create one with FREE plan
    if (!userProfile) {
      const newProfile = await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) throw new Error('Database unavailable')
        
        return await prisma.userApp.create({
          data: {
            userId: user.id,
            plan: 'FREE',
            usageCount: 0
          }
        })
      }, {
        userId: user.id,
        plan: 'FREE',
        usageCount: 0,
        expiryDate: null
      })
      
      return NextResponse.json({
        ok: true,
        profile: {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || user.user_metadata?.name,
          plan: 'FREE',
          usageCount: 0,
          expiryDate: null
        }
      })
    }

    return NextResponse.json({
      ok: true,
      profile: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name,
        plan: userProfile.plan,
        usageCount: userProfile.usageCount,
        expiryDate: userProfile.expiryDate
      }
    })

  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ 
      ok: false, 
      message: 'Internal server error',
      profile: {
        plan: 'FREE',
        usageCount: 0
      }
    }, { status: 500 })
  }
}


export async function PUT(request: NextRequest) {
  try {
    const { fullName, phone, organization } = await request.json()
    
    // Get user from session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Extract user ID from auth header or session
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ ok: false, message: 'Invalid session' }, { status: 401 })
    }

    // Update user profile
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        full_name: fullName,
        phone: phone || null,
        organization: organization || null,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ ok: false, message: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Profile updated successfully' 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}