import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { prepareDocumentForRAG } from '@/lib/embeddings'
import { storeDocumentChunks } from '@/lib/vector-db'

export const dynamic = 'force-dynamic'

// Extract text from PDF using simple parsing
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const text = buffer.toString('utf-8')
    // Basic text extraction - look for readable content
    const matches = text.match(/[\x20-\x7E\n\r]+/g) || []
    return matches.join(' ').substring(0, 10000)
  } catch {
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const caseId = formData.get('caseId') as string | null
    const linkedFeature = formData.get('linkedFeature') as string | null
    const userId = formData.get('userId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine file type
    const fileType = file.type || 'application/octet-stream'
    const isImage = fileType.startsWith('image/')
    const isPDF = fileType === 'application/pdf'

    // Extract text content
    let extractedText = ''
    if (isPDF) {
      extractedText = await extractTextFromPDF(buffer)
    } else if (!isImage) {
      extractedText = buffer.toString('utf-8').substring(0, 10000)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${safeName}`
    const filePath = `uploads/${userId || 'anonymous'}/${filename}`

    // Upload to Supabase Storage
    const supabase = getSupabaseAdmin()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, buffer, {
        contentType: fileType,
        upsert: true
      })

    let fileUrl = ''
    if (!uploadError && uploadData) {
      const { data: urlData } = supabase.storage.from('files').getPublicUrl(filePath)
      fileUrl = urlData.publicUrl
    }

    // Save to database if user is authenticated
    let savedFile = null
    let embeddingStats = { chunksCreated: 0, chunksStored: 0, chunksFailed: 0 }

    if (userId) {
      try {
        savedFile = await prisma.uploadedFile.create({
          data: {
            userId,
            filename: file.name,
            fileType,
            fileSize: buffer.length,
            content: extractedText || null
          }
        })

        // Automatically embed document for RAG if text was extracted
        if (extractedText && extractedText.length > 100) {
          try {
            const chunks = await prepareDocumentForRAG(
              savedFile.id,
              extractedText,
              {
                title: file.name,
                source: 'uploaded_file',
                pageNumber: 1
              }
            )

            const { stored, failed } = await storeDocumentChunks(chunks)
            embeddingStats = {
              chunksCreated: chunks.length,
              chunksStored: stored,
              chunksFailed: failed
            }

            console.log(`Embedded document ${savedFile.id}: ${stored} chunks stored`)
          } catch (embeddingError) {
            console.warn('Failed to embed document:', embeddingError)
            // Don't fail the upload if embedding fails
          }
        }
      } catch (dbError) {
        console.error('Failed to save file to database:', dbError)
      }
    }

    return NextResponse.json({
      ok: true,
      fileId: savedFile?.id || null,
      filename: file.name,
      fileType,
      fileSize: buffer.length,
      fileUrl,
      extractedText: extractedText.substring(0, 5000),
      caseId,
      linkedFeature,
      embedding: embeddingStats
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const caseId = searchParams.get('caseId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const files = await prisma.uploadedFile.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ files })
  } catch (error: any) {
    console.error('Fetch files error:', error)
    return NextResponse.json({ files: [] })
  }
}
