import { useEffect, useRef, useCallback } from 'react'

interface UseVisibilityPollingOptions {
  onPoll: () => void
  interval: number
  enabled?: boolean
}

export function useVisibilityPolling({ onPoll, interval, enabled = true }: UseVisibilityPollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isVisible = useRef(true)

  const startPolling = useCallback(() => {
    if (intervalRef.current) return
    
    intervalRef.current = setInterval(() => {
      if (isVisible.current && !document.hidden) {
        onPoll()
      }
    }, interval)
  }, [onPoll, interval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    if (enabled) {
      startPolling()
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      stopPolling()
    }
  }, [enabled, startPolling, stopPolling])

  return { startPolling, stopPolling }
}