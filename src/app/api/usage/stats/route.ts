import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getServerUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Get AI messages today
    const { count: aiMessagesToday } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())

    // Get drafts this month
    const { count: draftsThisMonth } = await supabase
      .from('drafts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', firstOfMonth.toISOString())

    // Get active cases (status = OPEN or no status)
    const { count: activeCases } = await supabase
      .from('case_tracker')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .or('status.eq.OPEN,status.eq.Pending,status.is.null')

    // Get total files uploaded
    const { count: filesUploaded } = await supabase
      .from('uploaded_files')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get summaries this month
    const { count: summariesThisMonth } = await supabase
      .from('summaries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', firstOfMonth.toISOString())

    return NextResponse.json({
      aiMessagesToday: aiMessagesToday || 0,
      draftsThisMonth: draftsThisMonth || 0,
      activeCases: activeCases || 0,
      filesUploaded: filesUploaded || 0,
      summariesThisMonth: summariesThisMonth || 0,
      lastUpdated: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Usage stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 })
  }
}
