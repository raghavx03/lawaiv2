// API Route: Search documents using RAG
// POST /api/documents/search
// Body: { query, topK, threshold, caseId }

import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { generateEmbedding } from '@/lib/embeddings'
import { searchSimilarDocuments, getDocumentChunks } from '@/lib/vector-db'
import { buildRAGContext } from '@/lib/rag-service'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query, topK = 5, threshold = 0.3, caseId } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)

    // Search for similar documents
    let results = await searchSimilarDocuments(queryEmbedding, topK, threshold)

    // If caseId provided, filter results to that case's documents
    if (caseId) {
      const caseChunks = await getDocumentChunks(caseId)
      const caseChunkIds = new Set(caseChunks.map(c => c.id))
      results = results.filter(r => caseChunkIds.has(r.id))
    }

    // Build RAG context
    const ragContext = await buildRAGContext(query, results, { topK, minSimilarity: threshold })

    return NextResponse.json({
      success: true,
      query,
      resultsFound: results.length,
      sources: ragContext.sources,
      context: ragContext.context,
      chunks: results.map(r => ({
        id: r.id,
        documentId: r.documentId,
        content: r.content.substring(0, 500), // Truncate for response
        chunkIndex: r.chunkIndex,
        metadata: r.metadata
      }))
    })
  } catch (error: any) {
    console.error('Document search error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search documents' },
      { status: 500 }
    )
  }
}
