// Vector Database Service
// Manages document embeddings and retrieval using Supabase pgvector
// Fallback to in-memory storage if pgvector not available

import { DocumentChunk } from './embeddings'

export interface VectorDBConfig {
  useSupabase?: boolean
  inMemoryFallback?: boolean
}

// In-memory storage for embeddings (fallback)
const inMemoryStore: Map<string, DocumentChunk> = new Map()

/**
 * Store document chunks in vector DB
 * Uses Supabase pgvector if available, falls back to in-memory
 */
export async function storeDocumentChunks(
  chunks: DocumentChunk[],
  config: VectorDBConfig = { useSupabase: true, inMemoryFallback: true }
): Promise<{ stored: number; failed: number }> {
  let stored = 0
  let failed = 0

  // Try Supabase first
  if (config.useSupabase) {
    try {
      const { prisma } = await import('@/lib/prisma')
      if (prisma) {
        for (const chunk of chunks) {
          try {
            // Store in database with embedding
            await prisma.documentEmbedding.upsert({
              where: { id: chunk.id },
              update: {
                content: chunk.content,
                chunkIndex: chunk.chunkIndex,
                embedding: chunk.embedding ? JSON.stringify(chunk.embedding) : null,
                metadata: chunk.metadata ? JSON.stringify(chunk.metadata) : null,
                updatedAt: new Date()
              },
              create: {
                id: chunk.id,
                documentId: chunk.documentId,
                content: chunk.content,
                chunkIndex: chunk.chunkIndex,
                embedding: chunk.embedding ? JSON.stringify(chunk.embedding) : null,
                metadata: chunk.metadata ? JSON.stringify(chunk.metadata) : null
              }
            })
            stored++
          } catch (error) {
            console.error(`Failed to store chunk ${chunk.id}:`, error)
            failed++
          }
        }
        return { stored, failed }
      }
    } catch (error) {
      console.warn('Supabase storage failed, falling back to in-memory:', error)
    }
  }

  // Fallback to in-memory storage
  if (config.inMemoryFallback) {
    for (const chunk of chunks) {
      try {
        inMemoryStore.set(chunk.id, chunk)
        stored++
      } catch (error) {
        console.error(`Failed to store chunk ${chunk.id} in memory:`, error)
        failed++
      }
    }
  }

  return { stored, failed }
}

/**
 * Search for similar documents using vector similarity
 * Uses Supabase pgvector if available, falls back to in-memory cosine similarity
 */
export async function searchSimilarDocuments(
  queryEmbedding: number[],
  topK: number = 5,
  threshold: number = 0.3
): Promise<DocumentChunk[]> {
  // Try Supabase pgvector first
  try {
    const { prisma } = await import('@/lib/prisma')
    if (prisma) {
      // Query using raw SQL for vector similarity
      const results = await prisma.$queryRaw<any[]>`
        SELECT 
          id,
          document_id as "documentId",
          content,
          chunk_index as "chunkIndex",
          embedding,
          metadata,
          1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
        FROM document_embeddings
        WHERE 1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > ${threshold}
        ORDER BY similarity DESC
        LIMIT ${topK}
      `

      return results.map(r => ({
        id: r.id,
        documentId: r.documentId,
        content: r.content,
        chunkIndex: r.chunkIndex,
        embedding: r.embedding ? JSON.parse(r.embedding) : undefined,
        metadata: r.metadata ? JSON.parse(r.metadata) : undefined
      }))
    }
  } catch (error) {
    console.warn('Supabase vector search failed, falling back to in-memory:', error)
  }

  // Fallback to in-memory cosine similarity search
  return searchInMemory(queryEmbedding, topK, threshold)
}

/**
 * In-memory cosine similarity search
 */
function searchInMemory(
  queryEmbedding: number[],
  topK: number,
  threshold: number
): DocumentChunk[] {
  const similarities: Array<{ chunk: DocumentChunk; similarity: number }> = []

  for (const chunk of inMemoryStore.values()) {
    if (!chunk.embedding || chunk.embedding.length === 0) continue

    const similarity = cosineSimilarity(queryEmbedding, chunk.embedding)
    if (similarity >= threshold) {
      similarities.push({ chunk, similarity })
    }
  }

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(s => s.chunk)
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) return 0

  return dotProduct / (normA * normB)
}

/**
 * Delete document chunks from vector DB
 */
export async function deleteDocumentChunks(documentId: string): Promise<number> {
  let deleted = 0

  // Try Supabase first
  try {
    const { prisma } = await import('@/lib/prisma')
    if (prisma) {
      const result = await prisma.documentEmbedding.deleteMany({
        where: { documentId }
      })
      deleted = result.count
      return deleted
    }
  } catch (error) {
    console.warn('Supabase delete failed, falling back to in-memory:', error)
  }

  // Fallback to in-memory
  for (const [key, chunk] of inMemoryStore.entries()) {
    if (chunk.documentId === documentId) {
      inMemoryStore.delete(key)
      deleted++
    }
  }

  return deleted
}

/**
 * Get all chunks for a document
 */
export async function getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
  // Try Supabase first
  try {
    const { prisma } = await import('@/lib/prisma')
    if (prisma) {
      const chunks = await prisma.documentEmbedding.findMany({
        where: { documentId },
        orderBy: { chunkIndex: 'asc' }
      })

      return chunks.map(c => ({
        id: c.id,
        documentId: c.documentId,
        content: c.content,
        chunkIndex: c.chunkIndex,
        embedding: c.embedding ? JSON.parse(c.embedding) : undefined,
        metadata: c.metadata ? JSON.parse(c.metadata) : undefined
      }))
    }
  } catch (error) {
    console.warn('Supabase fetch failed, falling back to in-memory:', error)
  }

  // Fallback to in-memory
  const chunks: DocumentChunk[] = []
  for (const chunk of inMemoryStore.values()) {
    if (chunk.documentId === documentId) {
      chunks.push(chunk)
    }
  }
  return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex)
}

/**
 * Get vector DB statistics
 */
export async function getVectorDBStats(): Promise<{
  totalChunks: number
  totalDocuments: number
  storageType: 'supabase' | 'in-memory'
}> {
  // Try Supabase first
  try {
    const { prisma } = await import('@/lib/prisma')
    if (prisma) {
      const count = await prisma.documentEmbedding.count()
      const docs = await prisma.documentEmbedding.findMany({
        distinct: ['documentId'],
        select: { documentId: true }
      })

      return {
        totalChunks: count,
        totalDocuments: docs.length,
        storageType: 'supabase'
      }
    }
  } catch (error) {
    console.warn('Supabase stats failed, using in-memory:', error)
  }

  // Fallback to in-memory
  const uniqueDocs = new Set<string>()
  for (const chunk of inMemoryStore.values()) {
    uniqueDocs.add(chunk.documentId)
  }

  return {
    totalChunks: inMemoryStore.size,
    totalDocuments: uniqueDocs.size,
    storageType: 'in-memory'
  }
}

/**
 * Clear all embeddings (for testing/reset)
 */
export async function clearAllEmbeddings(): Promise<void> {
  // Try Supabase first
  try {
    const { prisma } = await import('@/lib/prisma')
    if (prisma) {
      await prisma.documentEmbedding.deleteMany({})
      return
    }
  } catch (error) {
    console.warn('Supabase clear failed, clearing in-memory:', error)
  }

  // Fallback to in-memory
  inMemoryStore.clear()
}
