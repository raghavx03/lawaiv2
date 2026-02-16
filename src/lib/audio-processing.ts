// Audio Processing — STT via Whisper

export async function transcribeAudioWithWhisper(audioBuffer: Buffer): Promise<string> {
  const apiKey = process.env.OPENAI_WHISPER_KEY || process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured for STT')
  }

  try {
    const formData = new FormData()
    formData.append('file', new Blob([Uint8Array.from(audioBuffer)], { type: 'audio/webm' }), 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'en')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.status}`)
    }

    const data = await response.json()
    return data.text || ''
  } catch (error) {
    console.error('Whisper STT error:', error)
    throw error
  }
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  // Use Whisper if available
  if (process.env.OPENAI_WHISPER_KEY || process.env.OPENAI_API_KEY) {
    try {
      return await transcribeAudioWithWhisper(audioBuffer)
    } catch (error) {
      console.warn('Whisper STT failed:', error)
    }
  }

  throw new Error('No STT service available. Please configure OPENAI_WHISPER_KEY in .env.local.')
}

export function convertWebmToWav(webmBuffer: Buffer): Promise<Buffer> {
  return Promise.resolve(webmBuffer)
}