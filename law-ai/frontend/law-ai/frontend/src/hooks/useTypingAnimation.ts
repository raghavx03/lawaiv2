import { useState, useEffect, useCallback } from 'react'

interface UseTypingAnimationProps {
  text: string
  speed?: number
  isComplete?: boolean
}

export function useTypingAnimation({ text, speed = 30, isComplete = false }: UseTypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  const startTyping = useCallback(() => {
    setIsTyping(true)
    setCurrentIndex(0)
    setDisplayedText('')
  }, [])

  const stopTyping = useCallback(() => {
    setIsTyping(false)
    setDisplayedText(text)
    setCurrentIndex(text.length)
  }, [text])

  useEffect(() => {
    if (isComplete) {
      setDisplayedText(text)
      setIsTyping(false)
      return
    }

    if (!isTyping || currentIndex >= text.length) {
      setIsTyping(false)
      return
    }

    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1))
      setCurrentIndex(prev => prev + 1)
    }, speed)

    return () => clearTimeout(timer)
  }, [text, currentIndex, speed, isTyping, isComplete])

  useEffect(() => {
    if (text && !isComplete) {
      startTyping()
    }
  }, [text, isComplete, startTyping])

  return {
    displayedText,
    isTyping,
    startTyping,
    stopTyping,
    progress: text.length > 0 ? currentIndex / text.length : 0
  }
}