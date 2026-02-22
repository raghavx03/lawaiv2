// API Route: Generate embeddings for documents
// POST /api/embeddings/generate
// Body: { documentId, text, metadata }

import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { prepareDocumentForRAG } from '@/lib/embeddings'
import { storeDocumentChunks } from '@/lib/vector-db'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, text, metadata } = body

    if (!documentId || !text) {
      return NextResponse.json(
        { error: 'documentId and text are required' },
        { status: 400 }
      )
    }

    if (text.length === 0) {
      return NextResponse.json(
        { error: 'Document text cannot be empty' },
        { status: 400 }
      )
    }

    // Prepare document for RAG (chunk and embed)
    const chunks = await prepareDocumentForRAG(documentId, text, metadata)

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create document chunks' },
        { status: 500 }
      )
    }

    // Store chunks in vector DB
    const { stored, failed } = await storeDocumentChunks(chunks)

    return NextResponse.json({
      success: true,
      documentId,
      chunksCreated: chunks.length,
      chunksStored: stored,
      chunksFailed: failed,
      message: `Successfully embedded ${stored} chunks from document`
    })
  } catch (error: any) {
    console.error('Embedding generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate embeddings' },
      { status: 500 }
    )
  }
}
