import { createWorker } from 'tesseract.js'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use pdf-parse for text-based PDFs
    const pdfParse = await import('pdf-parse')
    const data = await pdfParse.default(buffer)
    
    if (data.text && data.text.trim().length > 50) {
      return data.text
    }
    
    // If no text found, it might be a scanned PDF - use OCR
    return await extractTextFromImageBuffer(buffer, 'pdf')
  } catch (error) {
    console.error('PDF text extraction failed:', error)
    return ''
  }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('DOCX text extraction failed:', error)
    return ''
  }
}

export async function extractTextFromImage(file: File): Promise<string> {
  try {
    const worker = await createWorker('eng')
    const { data: { text } } = await worker.recognize(file)
    await worker.terminate()
    return text
  } catch (error) {
    console.error('Image OCR failed:', error)
    return ''
  }
}

export async function extractTextFromImageBuffer(buffer: Buffer, format: string): Promise<string> {
  try {
    const worker = await createWorker('eng')
    const { data: { text } } = await worker.recognize(buffer)
    await worker.terminate()
    return text
  } catch (error) {
    console.error('Image buffer OCR failed:', error)
    return ''
  }
}

export function getFileTypeFromMime(mimeType: string): 'image' | 'pdf' | 'docx' | 'text' | 'unknown' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx'
  if (mimeType === 'text/plain') return 'text'
  return 'unknown'
}

export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  const fileType = getFileTypeFromMime(mimeType)
  
  switch (fileType) {
    case 'pdf':
      return await extractTextFromPDF(buffer)
    case 'docx':
      return await extractTextFromDocx(buffer)
    case 'image':
      return await extractTextFromImageBuffer(buffer, 'image')
    case 'text':
      return buffer.toString('utf-8')
    default:
      return ''
  }
}