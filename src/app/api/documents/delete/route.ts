// API Route: Delete document embeddings
// DELETE /api/documents/delete
// Body: { documentId }

import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { deleteDocumentChunks } from '@/lib/vector-db'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId } = body

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      )
    }

    // Delete document chunks from vector DB
    const deleted = await deleteDocumentChunks(documentId)

    return NextResponse.json({
      success: true,
      documentId,
      chunksDeleted: deleted,
      message: `Successfully deleted ${deleted} chunks`
    })
  } catch (error: any) {
    console.error('Document deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    )
  }
}
