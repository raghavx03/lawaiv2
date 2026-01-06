export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { createGuardedHandler } from '@/lib/security/guards'
import { sanitizeInput } from '@/lib/security/input-sanitizer'
import path from 'path'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export const POST = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
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
    if (safeName !== file.name || safeName.includes('..') || safeName.includes('/') || safeName.includes('\\')) {
      return NextResponse.json({ ok: false, error: 'Invalid filename' }, { status: 400 })
    }
    
    // Read file content
    const buffer = await file.arrayBuffer()
    const content = Buffer.from(buffer).toString('utf-8')
    
    // Store file metadata in database
    const { prisma } = await import('@/lib/prisma')
    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        userId: auth.user.id,
        filename: safeName,
        fileType: file.type,
        fileSize: file.size,
        content: content.substring(0, 50000), // Limit content size
        uploadedAt: new Date()
      }
    })
    
    return NextResponse.json({
      ok: true,
      fileId: uploadedFile.id,
      filename: uploadedFile.filename,
      size: uploadedFile.fileSize
    })
  },
  { requireAuth: true, requireCSRF: true }
)