// OCR (Optical Character Recognition) Service
// Extracts text from scanned documents and images
// Uses tesseract.js for client-side and server-side OCR

export interface OCRResult {
  text: string
  confidence: number
  language: string
  pages?: OCRPageResult[]
}

export interface OCRPageResult {
  pageNumber: number
  text: string
  confidence: number
  blocks?: OCRBlock[]
}

export interface OCRBlock {
  text: string
  confidence: number
  bbox?: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
}

/**
 * Extract text from image buffer using Tesseract.js
 * Supports multiple languages including Hindi
 */
export async function extractTextFromImage(
  imageBuffer: Buffer,
  languages: string[] = ['eng', 'hin']
): Promise<OCRResult> {
  try {
    // Dynamic import for Tesseract.js (client-side library)
    // For server-side, we'll use a simpler approach
    
    // Note: Tesseract.js is primarily a client-side library
    // For server-side OCR, consider using:
    // - Google Cloud Vision API
    // - AWS Textract
    // - Azure Computer Vision
    // - Tesseract CLI (if installed on server)
    
    console.warn('Server-side OCR not fully implemented. Use client-side Tesseract.js or cloud API.')
    
    return {
      text: '',
      confidence: 0,
      language: 'unknown',
      pages: []
    }
  } catch (error) {
    console.error('OCR extraction failed:', error)
    throw error
  }
}

/**
 * Extract text from PDF with OCR
 * Handles both text-based and scanned PDFs
 */
export async function extractTextFromPDFWithOCR(
  pdfBuffer: Buffer,
  options?: {
    languages?: string[]
    pageRange?: { start: number; end: number }
  }
): Promise<OCRResult> {
  try {
    // For PDF OCR, we need:
    // 1. PDF parser (pdf-parse or pdfjs-dist)
    // 2. Image extraction from PDF
    // 3. OCR on extracted images
    
    // This is a placeholder for the full implementation
    // In production, use:
    // - pdf-parse for text extraction
    // - pdfjs-dist for rendering pages to images
    // - Tesseract.js or cloud API for OCR
    
    console.warn('PDF OCR not fully implemented. Use cloud API or integrate pdf-parse + Tesseract.js')
    
    return {
      text: '',
      confidence: 0,
      language: 'unknown',
      pages: []
    }
  } catch (error) {
    console.error('PDF OCR extraction failed:', error)
    throw error
  }
}

/**
 * Detect language in OCR result
 */
export function detectOCRLanguage(text: string): string {
  // Check for Devanagari script (Hindi)
  const devanagariRegex = /[\u0900-\u097F]/g
  const devanagariMatches = text.match(devanagariRegex)
  
  if (devanagariMatches && devanagariMatches.length > text.length * 0.3) {
    return 'hin'
  }
  
  // Default to English
  return 'eng'
}

/**
 * Clean OCR text
 * Removes artifacts and improves readability
 */
export function cleanOCRText(text: string): string {
  return text
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove common OCR artifacts
    .replace(/[|]/g, 'I')
    .replace(/[0O]/g, 'O')
    .replace(/[1l]/g, 'l')
    // Fix common OCR errors
    .replace(/tlie/g, 'the')
    .replace(/tne/g, 'the')
    .replace(/rn/g, 'm')
    .replace(/vv/g, 'w')
    // Trim
    .trim()
}

/**
 * Validate OCR confidence
 * Returns true if confidence is above threshold
 */
export function isOCRConfident(confidence: number, threshold: number = 0.7): boolean {
  return confidence >= threshold
}

/**
 * Format OCR result for display
 */
export function formatOCRResult(result: OCRResult): string {
  const lines: string[] = []
  
  lines.push(`**OCR Result**`)
  lines.push(`Language: ${result.language}`)
  lines.push(`Confidence: ${(result.confidence * 100).toFixed(1)}%`)
  lines.push('')
  lines.push('**Extracted Text:**')
  lines.push(result.text)
  
  if (result.pages && result.pages.length > 0) {
    lines.push('')
    lines.push(`**Pages: ${result.pages.length}**`)
  }
  
  return lines.join('\n')
}

/**
 * Client-side OCR using Tesseract.js
 * This function is meant to be used in browser environment
 */
export async function clientSideOCR(
  imageFile: File,
  languages: string[] = ['eng', 'hin']
): Promise<OCRResult> {
  // This is a placeholder for client-side implementation
  // In actual implementation, use:
  // import Tesseract from 'tesseract.js'
  // const result = await Tesseract.recognize(imageFile, languages.join('+'))
  
  console.warn('Client-side OCR requires Tesseract.js library')
  
  return {
    text: '',
    confidence: 0,
    language: 'unknown'
  }
}

/**
 * Batch OCR processing
 * Process multiple images/pages
 */
export async function batchOCR(
  files: Buffer[],
  languages: string[] = ['eng', 'hin']
): Promise<OCRResult[]> {
  const results: OCRResult[] = []
  
  for (const file of files) {
    try {
      const result = await extractTextFromImage(file, languages)
      results.push(result)
    } catch (error) {
      console.error('Batch OCR failed for file:', error)
      results.push({
        text: '',
        confidence: 0,
        language: 'unknown'
      })
    }
  }
  
  return results
}

/**
 * Merge OCR results from multiple pages
 */
export function mergeOCRResults(results: OCRResult[]): OCRResult {
  if (results.length === 0) {
    return {
      text: '',
      confidence: 0,
      language: 'unknown'
    }
  }
  
  const mergedText = results.map(r => r.text).join('\n\n')
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length
  
  // Detect language from merged text
  const language = detectOCRLanguage(mergedText)
  
  return {
    text: mergedText,
    confidence: avgConfidence,
    language,
    pages: results.map((r, idx) => ({
      pageNumber: idx + 1,
      text: r.text,
      confidence: r.confidence
    }))
  }
}

/**
 * Estimate OCR quality
 * Returns quality assessment
 */
export function assessOCRQuality(result: OCRResult): {
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  score: number
  recommendations: string[]
} {
  const recommendations: string[] = []
  let score = result.confidence
  
  // Check text length
  if (result.text.length < 100) {
    score -= 0.2
    recommendations.push('Text is very short - may indicate poor OCR quality')
  }
  
  // Check for common OCR artifacts
  const artifactCount = (result.text.match(/[|1l0O]/g) || []).length
  if (artifactCount > result.text.length * 0.05) {
    score -= 0.1
    recommendations.push('High number of potential OCR artifacts detected')
  }
  
  // Determine quality level
  let quality: 'excellent' | 'good' | 'fair' | 'poor'
  if (score >= 0.9) quality = 'excellent'
  else if (score >= 0.7) quality = 'good'
  else if (score >= 0.5) quality = 'fair'
  else quality = 'poor'
  
  if (quality !== 'excellent') {
    recommendations.push('Consider manual review or re-scanning the document')
  }
  
  return {
    quality,
    score,
    recommendations
  }
}
