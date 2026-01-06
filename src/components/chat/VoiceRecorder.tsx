'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Square, Play, Trash2 } from 'lucide-react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  disabled?: boolean
}

export function VoiceRecorder({ onTranscription, disabled }: VoiceRecorderProps) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcribedText, setTranscribedText] = useState('')
  const { 
    isRecording, 
    audioBlob, 
    duration, 
    startRecording, 
    stopRecording, 
    clearRecording, 
    error 
  } = useAudioRecorder()

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const handleStartRecording = async () => {
    setTranscribedText('')
    await startRecording()
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  const handleTranscribe = async () => {
    if (!audioBlob) return
    
    setIsTranscribing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const response = await fetch('/api/uploads/audio', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Transcription failed')
      }
      
      const data = await response.json()
      setTranscribedText(data.transcription)
      
    } catch (error) {
      console.error('Transcription error:', error)
      // Fallback to Web Speech API if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setTranscribedText('Voice transcription failed. Please type your message.')
      }
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleUseTranscription = () => {
    onTranscription(transcribedText)
    clearRecording()
    setTranscribedText('')
  }

  const handleClear = () => {
    clearRecording()
    setTranscribedText('')
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return null // Voice recording not supported
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-red-400 bg-red-900/20 p-2 rounded"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-2">
        {!isRecording && !audioBlob && (
          <Button
            onClick={handleStartRecording}
            disabled={disabled}
            variant="outline"
            size="sm"
            className="ai-chat-input border-green-500/30 hover:border-green-500/50"
          >
            <Mic className="h-4 w-4 mr-2" />
            Record
          </Button>
        )}

        {isRecording && (
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
            <span className="text-sm text-red-400">{formatDuration(duration)}</span>
            <Button
              onClick={handleStopRecording}
              variant="outline"
              size="sm"
              className="border-red-500/30 hover:border-red-500/50"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        )}

        {audioBlob && !transcribedText && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">{formatDuration(duration)}</span>
            <Button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              variant="outline"
              size="sm"
              className="border-green-500/30 hover:border-green-500/50"
            >
              {isTranscribing ? 'Transcribing...' : 'Transcribe'}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="border-gray-500/30 hover:border-gray-500/50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {transcribedText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="ai-chat-input p-3 rounded-lg text-sm">
              {transcribedText}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleUseTranscription}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Use This Text
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}