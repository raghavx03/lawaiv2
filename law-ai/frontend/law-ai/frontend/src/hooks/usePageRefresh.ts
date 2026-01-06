'use client'

import { useState, useEffect } from 'react'

export function usePageRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(true)

  useEffect(() => {
    // Check if page was refreshed
    const wasRefreshed = performance.navigation?.type === 1 || 
                        (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type === 'reload'
    
    if (wasRefreshed) {
      setIsRefreshing(true)
    }

    // Always show loading for at least 1 second on mount
    const timer = setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return isRefreshing
}