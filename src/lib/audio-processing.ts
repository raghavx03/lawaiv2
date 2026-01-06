export async function transcribeAudioWithGemini(audioBuffer: Buffer): Promise<string> {
  const apiKey = process.env.GEMINI_STT_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  try {
    // Convert audio to base64
    const base64Audio = audioBuffer.toString('base64')
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Please transcribe this audio file to text. Return only the transcribed text without any additional formatting or commentary."
          }, {
            inline_data: {
              mime_type: "audio/webm",
              data: base64Audio
            }
          }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini STT API error: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } catch (error) {
    console.error('Gemini STT error:', error)
    throw error
  }
}

export async function transcribeAudioWithWhisper(audioBuffer: Buffer): Promise<string> {
  const apiKey = process.env.OPENAI_WHISPER_KEY || process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const formData = new FormData()
    formData.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm')
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
  // Try Gemini first if available
  if (process.env.GEMINI_STT_KEY || process.env.GEMINI_API_KEY) {
    try {
      return await transcribeAudioWithGemini(audioBuffer)
    } catch (error) {
      console.warn('Gemini STT failed, trying Whisper:', error)
    }
  }

  // Fallback to Whisper if available
  if (process.env.OPENAI_WHISPER_KEY || process.env.OPENAI_API_KEY) {
    try {
      return await transcribeAudioWithWhisper(audioBuffer)
    } catch (error) {
      console.warn('Whisper STT failed:', error)
    }
  }

  throw new Error('No STT service available. Please configure GEMINI_STT_KEY or OPENAI_WHISPER_KEY.')
}

export function convertWebmToWav(webmBuffer: Buffer): Promise<Buffer> {
  // In a real implementation, you'd use ffmpeg or similar
  // For now, return the original buffer as many STT services accept WebM
  return Promise.resolve(webmBuffer)
}