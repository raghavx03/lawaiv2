// API Route: Get vector DB statistics
// GET /api/documents/stats

import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { getVectorDBStats } from '@/lib/vector-db'

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await getVectorDBStats()

    return NextResponse.json({
      success: true,
      stats,
      message: `Vector DB contains ${stats.totalChunks} chunks from ${stats.totalDocuments} documents`
    })
  } catch (error: any) {
    console.error('Stats retrieval error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get statistics' },
      { status: 500 }
    )
  }
}
