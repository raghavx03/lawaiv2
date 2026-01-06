export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { theme } = await request.json()

    if (!['light', 'dark', 'system'].includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
    }

    // Try to update database, but don't fail if DB is unavailable
    try {
      const { safeDbOperation } = await import('@/lib/prisma')
      await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) return null
        
        return await prisma.userApp.upsert({
          where: { userId: user.id },
          update: { 
            themePreference: theme,
            updatedAt: new Date()
          },
          create: {
            userId: user.id,
            email: user.email || '',
            fullName: user.user_metadata?.full_name || '',
            plan: 'FREE',
            usageCount: 0,
            themePreference: theme
          }
        })
      }, null)
    } catch (dbError) {
      console.warn('Database unavailable for theme update:', dbError)
      // Continue without database - theme will be stored client-side
    }

    return NextResponse.json({ success: true, theme })
  } catch (error) {
    console.error('Theme update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get theme from database, fallback to default
    let theme = 'system'
    try {
      const { safeDbOperation } = await import('@/lib/prisma')
      const userProfile = await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) return null
        
        return await prisma.userApp.findUnique({
          where: { userId: user.id },
          select: { themePreference: true }
        })
      }, null)
      
      theme = userProfile?.themePreference || 'system'
    } catch (dbError) {
      console.warn('Database unavailable for theme fetch:', dbError)
      // Return default theme
    }

    return NextResponse.json({ theme })
  } catch (error) {
    console.error('Theme fetch error:', error)
    return NextResponse.json({ theme: 'system' })
  }
}