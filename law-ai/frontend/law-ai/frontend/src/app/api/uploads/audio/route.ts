export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/audio-processing'

export const runtime = 'nodejs'

const MAX_AUDIO_SIZE = 25 * 1024 * 1024 // 25MB
const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/wav',
  'audio/mp3',
  'audio/m4a',
  'audio/ogg'
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(audioFile.type)) {
      return NextResponse.json({ 
        error: 'Unsupported audio format' 
      }, { status: 400 })
    }

    // Validate file size
    if (audioFile.size > MAX_AUDIO_SIZE) {
      return NextResponse.json({ 
        error: 'Audio file too large. Maximum size is 25MB.' 
      }, { status: 400 })
    }

    // Convert to buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    
    // Transcribe audio
    let transcription = ''
    try {
      transcription = await transcribeAudio(buffer)
    } catch (error) {
      console.error('Transcription error:', error)
      return NextResponse.json({ 
        error: 'Transcription failed. Please try again or type your message manually.',
        fallback: true
      }, { status: 422 })
    }

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json({ 
        error: 'No speech detected in audio. Please try recording again.',
        fallback: true
      }, { status: 422 })
    }

    return NextResponse.json({
      transcription: transcription.trim(),
      duration: audioFile.size, // Approximate
      confidence: 0.9 // Placeholder
    })

  } catch (error) {
    console.error('Audio upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}