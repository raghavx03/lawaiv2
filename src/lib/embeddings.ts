// Document embedding and chunking service
// Prepares documents for RAG (Retrieval Augmented Generation)

export interface DocumentChunk {
  id: string
  documentId: string
  content: string
  chunkIndex: number
  embedding?: number[]
  metadata?: {
    title?: string
    source?: string
    pageNumber?: number
    createdAt?: Date
  }
}

export interface EmbeddingResult {
  text: string
  embedding: number[]
  model: string
}

// NVIDIA NV-Embed model for generating embeddings
const NVIDIA_EMBEDDING_MODEL = 'nvidia/nv-embed-v2'
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'

// Chunk size: 500 tokens (approximately 2000 characters)
const CHUNK_SIZE = 2000
const CHUNK_OVERLAP = 200

/**
 * Split document into chunks for embedding
 * Uses sliding window approach to maintain context
 */
export function chunkDocument(
  text: string,
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): string[] {
  if (!text || text.length === 0) return []
  
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.substring(start, end).trim()
    
    if (chunk.length > 0) {
      chunks.push(chunk)
    }
    
    // Move start position by chunk size minus overlap
    start += chunkSize - overlap
  }
  
  return chunks
}

/**
 * Generate embedding for text using NVIDIA NV-Embed
 * Returns vector representation of the text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.NVIDIA_LLAMA_API_KEY
  if (!apiKey || apiKey === 'placeholder' || apiKey.includes('your_')) {
    throw new Error('NVIDIA API key not configured for embeddings')
  }
  
  if (!text || text.length === 0) {
    throw new Error('Cannot generate embedding for empty text')
  }
  
  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: NVIDIA_EMBEDDING_MODEL,
        input: text,
        encoding_format: 'float'
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`NVIDIA Embedding API error ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Invalid embedding response: no data returned')
    }
    
    const embedding = data.data[0]?.embedding
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Invalid embedding format')
    }
    
    return embedding
  } catch (error) {
    console.error('Embedding generation failed:', error)
    throw error
  }
}

/**
 * Generate embeddings for document chunks
 * Returns array of chunks with embeddings
 */
export async function embedDocumentChunks(
  documentId: string,
  chunks: string[],
  metadata?: {
    title?: string
    source?: string
    pageNumber?: number
  }
): Promise<DocumentChunk[]> {
  const embeddedChunks: DocumentChunk[] = []
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    
    try {
      const embedding = await generateEmbedding(chunk)
      
      embeddedChunks.push({
        id: `${documentId}-chunk-${i}`,
        documentId,
        content: chunk,
        chunkIndex: i,
        embedding,
        metadata: {
          ...metadata,
          createdAt: new Date()
        }
      })
    } catch (error) {
      console.error(`Failed to embed chunk ${i}:`, error)
      // Continue with other chunks even if one fails
    }
  }
  
  return embeddedChunks
}

/**
 * Calculate similarity between two embeddings using cosine similarity
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same length')
  }
  
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
  
  if (normA === 0 || normB === 0) {
    return 0
  }
  
  return dotProduct / (normA * normB)
}

/**
 * Find most similar chunks to a query
 * Used for RAG retrieval
 */
export async function findSimilarChunks(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 5
): Promise<DocumentChunk[]> {
  if (chunks.length === 0) {
    return []
  }
  
  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)
    
    // Calculate similarity for each chunk
    const similarities = chunks
      .filter(chunk => chunk.embedding && chunk.embedding.length > 0)
      .map(chunk => ({
        chunk,
        similarity: cosineSimilarity(queryEmbedding, chunk.embedding!)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
    
    return similarities.map(s => s.chunk)
  } catch (error) {
    console.error('Failed to find similar chunks:', error)
    return []
  }
}

/**
 * Prepare document for RAG pipeline
 * Chunks, embeds, and returns ready-to-store chunks
 */
export async function prepareDocumentForRAG(
  documentId: string,
  text: string,
  metadata?: {
    title?: string
    source?: string
    pageNumber?: number
  }
): Promise<DocumentChunk[]> {
  // Step 1: Chunk the document
  const chunks = chunkDocument(text)
  
  if (chunks.length === 0) {
    throw new Error('Document produced no chunks')
  }
  
  // Step 2: Generate embeddings for chunks
  const embeddedChunks = await embedDocumentChunks(documentId, chunks, metadata)
  
  return embeddedChunks
}

/**
 * Format chunks for context injection into LLM prompt
 */
export function formatChunksForContext(chunks: DocumentChunk[]): string {
  if (chunks.length === 0) {
    return ''
  }
  
  const formattedChunks = chunks
    .map((chunk, index) => `[Document ${index + 1}]\n${chunk.content}`)
    .join('\n\n---\n\n')
  
  return `Based on the following document excerpts:\n\n${formattedChunks}`
}

/**
 * Create RAG context for AI prompt
 * Combines retrieved chunks with user query
 */
export function createRAGContext(
  query: string,
  retrievedChunks: DocumentChunk[]
): string {
  if (retrievedChunks.length === 0) {
    return query
  }
  
  const context = formatChunksForContext(retrievedChunks)
  
  return `${context}\n\nUser Query: ${query}`
}
