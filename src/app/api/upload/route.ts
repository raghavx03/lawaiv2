
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { createGuardedHandler } from '@/lib/security/guards'
import { sanitizeInput } from '@/lib/security/input-sanitizer'
import path from 'path'
import { extractTextFromPdf, extractTextFromDocx } from '@/lib/server-pdf-utils'
import { chunkText, generateEmbedding } from '@/lib/rag'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export const POST = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 })
      }

      // Validate file
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ ok: false, error: 'File too large' }, { status: 400 })
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ ok: false, error: 'Invalid file type' }, { status: 400 })
      }

      // Prevent path traversal
      const safeName = path.basename(sanitizeInput(file.name))

      // Read file content
      const buffer = Buffer.from(await file.arrayBuffer())
      let content = ''

      // Extract text
      if (file.type === 'application/pdf') {
        content = await extractTextFromPdf(buffer)
      } else if (file.type === 'text/plain') {
        content = buffer.toString('utf-8')
      } else {
        // Basic DOCX extraction support if implementated, else empty
        content = await extractTextFromDocx(buffer)
      }

      if (!content || content.length < 10) {
        // Fallback for scanned PDFs or empty files - save file but skip RAG
        console.warn('Extracted content too short or empty')
      }

      // Store file metadata
      const { prisma } = await import('@/lib/prisma')
      const uploadedFile = await prisma.uploadedFile.create({
        data: {
          userId: auth.user.id,
          filename: safeName,
          fileType: file.type,
          fileSize: file.size,
          content: content.substring(0, 50000), // Limit storage size
          uploadedAt: new Date()
        }
      })

      // RAG Pipeline: Generate & Store Embeddings
      if (content.length > 50) {
        // Process chunks
        const chunks = chunkText(content)

        // Limit to first 20 chunks to avoid timeout on Vercel free tier
        // Detailed documents need background worker
        const MAX_CHUNKS = 20
        const chunksToProcess = chunks.slice(0, MAX_CHUNKS)

        console.log(`Processing ${chunksToProcess.length} chunks for RAG via NVIDIA...`)

        // Generate embeddings in parallel batches of 5
        for (let i = 0; i < chunksToProcess.length; i += 5) {
          const batch = chunksToProcess.slice(i, i + 5)
          await Promise.all(batch.map(async (chunk) => {
            try {
              const vector = await generateEmbedding(chunk)
              if (vector && vector.length > 0) {
                // Raw SQL insert for vector type
                // Must cast to vector type: '[...]'::vector
                const vectorStr = `[${vector.join(',')}]`

                await prisma.$executeRaw`
                               INSERT INTO "document_embeddings" (
                                 "id", 
                                 "uploaded_file_id", 
                                 "content", 
                                 "embedding", 
                                 "created_at"
                               )
                               VALUES (
                                 gen_random_uuid(), 
                                 ${uploadedFile.id}::uuid, 
                                 ${chunk}, 
                                 ${vectorStr}::vector, 
                                 NOW()
                               );
                             `
              }
            } catch (err) {
              console.error('Embedding generation failed for chunk:', err)
            }
          }))
        }
      }

      return NextResponse.json({
        ok: true,
        fileId: uploadedFile.id,
        filename: uploadedFile.filename,
        ragProcessed: content.length > 50
      })

    } catch (error) {
      console.error('Upload handler error:', error)
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
    }
  },
  { requireAuth: true, requireCSRF: true }
)