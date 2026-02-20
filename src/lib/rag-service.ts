// RAG (Retrieval Augmented Generation) Service
// Manages document retrieval and context injection for AI responses

import { DocumentChunk, findSimilarChunks, createRAGContext } from './embeddings'

export interface RAGContext {
  query: string
  retrievedChunks: DocumentChunk[]
  context: string
  sources: string[]
}

export interface RAGConfig {
  topK?: number // Number of chunks to retrieve
  minSimilarity?: number // Minimum similarity threshold
  maxContextLength?: number // Maximum context length in characters
}

const DEFAULT_CONFIG: RAGConfig = {
  topK: 5,
  minSimilarity: 0.3,
  maxContextLength: 4000
}

/**
 * Retrieve relevant documents for a query
 * This is the core RAG retrieval function
 */
export async function retrieveDocuments(
  query: string,
  availableChunks: DocumentChunk[],
  config: RAGConfig = DEFAULT_CONFIG
): Promise<DocumentChunk[]> {
  if (!query || query.length === 0) {
    return []
  }
  
  if (availableChunks.length === 0) {
    return []
  }
  
  try {
    // Find similar chunks using embedding similarity
    const similarChunks = await findSimilarChunks(
      query,
      availableChunks,
      config.topK || DEFAULT_CONFIG.topK!
    )
    
    // Filter by minimum similarity if needed
    // Note: This would require storing similarity scores
    // For now, we return all retrieved chunks
    
    return similarChunks
  } catch (error) {
    console.error('Document retrieval failed:', error)
    return []
  }
}

/**
 * Build RAG context for AI prompt
 * Combines retrieved documents with user query
 */
export async function buildRAGContext(
  query: string,
  availableChunks: DocumentChunk[],
  config: RAGConfig = DEFAULT_CONFIG
): Promise<RAGContext> {
  // Retrieve relevant documents
  const retrievedChunks = await retrieveDocuments(query, availableChunks, config)
  
  // Create context string
  const context = createRAGContext(query, retrievedChunks)
  
  // Extract sources from retrieved chunks
  const sources = Array.from(
    new Set(
      retrievedChunks
        .map(chunk => chunk.metadata?.source || chunk.documentId)
        .filter(Boolean)
    )
  )
  
  return {
    query,
    retrievedChunks,
    context,
    sources
  }
}

/**
 * Inject RAG context into AI messages
 * Modifies the user message to include retrieved context
 */
export function injectRAGContext(
  messages: Array<{ role: string; content: string }>,
  ragContext: RAGContext
): Array<{ role: string; content: string }> {
  if (ragContext.retrievedChunks.length === 0) {
    return messages
  }
  
  // Find the last user message
  const lastUserMessageIndex = messages.findIndex(
    (msg, idx) => msg.role === 'user' && idx === messages.length - 1
  )
  
  if (lastUserMessageIndex === -1) {
    return messages
  }
  
  // Create new messages array with injected context
  const newMessages = [...messages]
  const lastUserMessage = newMessages[lastUserMessageIndex]
  
  // Prepend context to user message
  newMessages[lastUserMessageIndex] = {
    ...lastUserMessage,
    content: `${ragContext.context}\n\nPlease answer based on the above documents.`
  }
  
  return newMessages
}

/**
 * Format retrieved chunks for display
 * Shows sources and relevance
 */
export function formatRetrievedChunks(chunks: DocumentChunk[]): string {
  if (chunks.length === 0) {
    return 'No relevant documents found.'
  }
  
  const formatted = chunks
    .map((chunk, index) => {
      const source = chunk.metadata?.source || chunk.documentId
      const title = chunk.metadata?.title || 'Untitled'
      
      return `**Source ${index + 1}: ${title}** (${source})\n${chunk.content.substring(0, 200)}...`
    })
    .join('\n\n')
  
  return `**Retrieved Documents:**\n\n${formatted}`
}

/**
 * Check if RAG context is available
 * Returns true if there are documents to retrieve from
 */
export function isRAGAvailable(chunks: DocumentChunk[]): boolean {
  return chunks && chunks.length > 0
}

/**
 * Get RAG statistics
 * Returns info about available documents
 */
export function getRAGStats(chunks: DocumentChunk[]): {
  totalChunks: number
  uniqueDocuments: number
  totalSize: number
} {
  const uniqueDocs = new Set(chunks.map(c => c.documentId))
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.content.length, 0)
  
  return {
    totalChunks: chunks.length,
    uniqueDocuments: uniqueDocs.size,
    totalSize
  }
}

/**
 * Prepare RAG system prompt
 * Instructs AI to use retrieved context
 */
export function getRAGSystemPrompt(): string {
  return `You are an expert legal AI assistant specializing in Indian law.

IMPORTANT: You have access to relevant documents that have been retrieved for this query.

RULES FOR USING RETRIEVED DOCUMENTS:
1. Always cite the specific document or section you're referencing
2. If the retrieved documents contain relevant information, use it as the primary source
3. If information is not in the retrieved documents, you may use your general knowledge but clearly state this
4. Always provide citations in the format: [Source: Document Name, Section X]
5. If the retrieved documents contradict your general knowledge, prioritize the retrieved documents

CITATION FORMAT:
- For sections: "Section 420 IPC [Source: Indian Penal Code]"
- For cases: "Landmark Case Name [Source: Case Law Database]"
- For documents: "[Source: Document Title, Page X]"

End your response with a "Sources" section listing all documents you referenced.`
}
