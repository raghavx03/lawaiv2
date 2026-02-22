import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { sanitizeInput } from '@/lib/validation'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Check if we have valid environment variables
  if (!url || !key || url.includes('your_') || key.includes('your_')) {
    return null
  }
  
  try {
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (error) {
    console.warn('Failed to create Supabase admin client:', error)
    return null
  }
}

const supabaseAdmin = createSupabaseAdmin()

export async function GET() {
  try {
    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Admin functionality not available - missing configuration',
        users: [],
        stats: { total: 0, free: 0, paid: 0, active: 0 }
      }, { status: 503 })
    }

    // Authentication check
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin access check
    const adminEmails = ['admin@law.ai', 'raghav@law.ai', 'shivangibabbar0211@gmail.com']
    if (!adminEmails.includes(user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Auth users error:', authError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get profiles from user_profiles table
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')

    if (profilesError) {
      console.error('Profiles error:', profilesError)
    }

    // Optimize profile lookup with Map for O(1) performance
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
    
    // Combine auth users with profiles
    const users = authUsers.users.map(authUser => {
      const profile = profileMap.get(authUser.id)
      return {
        id: authUser.id,
        email: sanitizeInput(authUser.email || ''),
        full_name: sanitizeInput(authUser.user_metadata?.full_name || profile?.full_name || ''),
        plan: profile?.plan || 'free',
        expiry_date: profile?.expiry_date || null,
        usage_count: profile?.usage_count || 0,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at
      }
    })

    // Calculate stats
    const stats = {
      total: users.length,
      free: users.filter(u => u.plan === 'free').length,
      paid: users.filter(u => u.plan !== 'free').length,
      active: users.filter(u => {
        if (!u.last_sign_in_at) return false
        const lastSignIn = new Date(u.last_sign_in_at)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - lastSignIn.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 1
      }).length
    }

    return NextResponse.json({ users, stats })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}