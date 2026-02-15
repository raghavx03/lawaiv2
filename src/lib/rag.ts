
import { embed } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'

const nvidiaProvider = createOpenAI({
    baseURL: NVIDIA_BASE_URL,
    apiKey: process.env.NVIDIA_LLAMA_API_KEY || ''
})

export async function generateEmbedding(text: string): Promise<number[]> {
    // Truncate if too long (simple approach) or rely on chunking before calling
    const cleanText = text.replace(/\n/g, ' ').substring(0, 2000)

    const { embedding } = await embed({
        model: nvidiaProvider.embedding('nvidia/embed-qa-4'),
        value: cleanText,
    })

    return embedding
}

export function chunkText(text: string, maxChunkSize: number = 800): string[] {
    const chunks: string[] = []
    let currentChunk = ''

    const sentences = text.split(/[.!?]+/)

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkSize) {
            if (currentChunk) chunks.push(currentChunk.trim())
            currentChunk = sentence
        } else {
            currentChunk += (currentChunk ? '. ' : '') + sentence
        }
    }

    if (currentChunk) chunks.push(currentChunk.trim())

    return chunks
}
