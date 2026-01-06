import { useState, useEffect } from 'react'

interface BreakpointConfig {
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useResponsive(breakpoints: Partial<BreakpointConfig> = {}) {
  const bp = { ...defaultBreakpoints, ...breakpoints }
  
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof BreakpointConfig>('sm')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({ width, height })
      
      // Determine current breakpoint
      if (width >= bp['2xl']) {
        setCurrentBreakpoint('2xl')
      } else if (width >= bp.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= bp.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= bp.md) {
        setCurrentBreakpoint('md')
      } else {
        setCurrentBreakpoint('sm')
      }
    }

    // Set initial values
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [bp])

  const isMobile = screenSize.width < bp.md
  const isTablet = screenSize.width >= bp.md && screenSize.width < bp.lg
  const isDesktop = screenSize.width >= bp.lg
  const isLargeDesktop = screenSize.width >= bp.xl

  return {
    screenSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoints: bp,
    // Utility functions
    isAtLeast: (breakpoint: keyof BreakpointConfig) => screenSize.width >= bp[breakpoint],
    isBelow: (breakpoint: keyof BreakpointConfig) => screenSize.width < bp[breakpoint],
    isBetween: (min: keyof BreakpointConfig, max: keyof BreakpointConfig) => 
      screenSize.width >= bp[min] && screenSize.width < bp[max]
  }
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    
    const updateMatch = () => setMatches(media.matches)
    
    // Set initial value
    updateMatch()
    
    // Listen for changes
    media.addEventListener('change', updateMatch)
    
    // Cleanup
    return () => media.removeEventListener('change', updateMatch)
  }, [query])

  return matches
}

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      const userAgent = navigator.userAgent

      // Check for mobile devices
      if (width < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        setDeviceType('mobile')
      }
      // Check for tablets
      else if (width < 1024 || /iPad|Android/i.test(userAgent)) {
        setDeviceType('tablet')
      }
      // Desktop
      else {
        setDeviceType('desktop')
      }
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    
    return () => window.removeEventListener('resize', checkDeviceType)
  }, [])

  return deviceType
}

export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return orientation
}

export function useViewportSize() {
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    visualViewportHeight: typeof window !== 'undefined' && window.visualViewport 
      ? window.visualViewport.height 
      : (typeof window !== 'undefined' ? window.innerHeight : 0)
  })

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
        visualViewportHeight: window.visualViewport?.height || window.innerHeight
      })
    }

    const handleVisualViewportChange = () => {
      setViewportSize(prev => ({
        ...prev,
        visualViewportHeight: window.visualViewport?.height || window.innerHeight
      }))
    }

    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleVisualViewportChange)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleVisualViewportChange)
    }
  }, [])

  return viewportSize
}