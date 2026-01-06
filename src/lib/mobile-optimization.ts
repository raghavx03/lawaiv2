// Mobile Optimization Utilities

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768 || 
         ('ontouchstart' in window) || 
         (navigator.maxTouchPoints > 0)
}

export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

export const optimizeForMobile = () => {
  if (!isMobileDevice()) return
  
  // Prevent zoom on input focus
  const viewport = document.querySelector('meta[name=viewport]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover')
  }
  
  // Add mobile class to body
  document.body.classList.add('mobile-device')
  
  // Optimize touch events
  document.body.style.touchAction = 'manipulation'
  document.body.style.webkitTapHighlightColor = 'transparent'
  
  // Prevent overscroll
  document.body.style.overscrollBehavior = 'contain'
}

export const getMobileRazorpayConfig = () => ({
  display: {
    blocks: {
      utib: {
        name: 'Pay with UPI',
        instruments: [{ method: 'upi' }]
      },
      cards: {
        name: 'Cards',
        instruments: [{ method: 'card' }]
      },
      banks: {
        name: 'Net Banking',
        instruments: [{ method: 'netbanking' }]
      },
      wallets: {
        name: 'Wallets',
        instruments: [{ method: 'wallet' }]
      }
    },
    sequence: ['block.utib', 'block.cards', 'block.banks', 'block.wallets'],
    preferences: {
      show_default_blocks: true
    }
  },
  config: {
    display: {
      language: 'en'
    }
  },
  retry: {
    enabled: true,
    max_count: 3
  },
  modal: {
    backdropclose: false,
    escape: true,
    handleback: true,
    confirm_close: false,
    animation: true
  },
  theme: {
    color: '#3b82f6',
    backdrop_color: 'rgba(0, 0, 0, 0.6)'
  }
})

export const preventBodyScroll = () => {
  const scrollY = window.scrollY
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = '100%'
  return scrollY
}

export const restoreBodyScroll = (scrollY: number) => {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  window.scrollTo(0, scrollY)
}

export const addMobilePaymentListeners = (onDismiss?: () => void) => {
  let scrollY = 0
  
  const handlePaymentOpen = () => {
    scrollY = preventBodyScroll()
    document.body.classList.add('razorpay-mobile-open')
  }
  
  const handlePaymentClose = () => {
    restoreBodyScroll(scrollY)
    document.body.classList.remove('razorpay-mobile-open')
    if (onDismiss) onDismiss()
  }
  
  return { handlePaymentOpen, handlePaymentClose }
}

export const optimizeImageLoading = () => {
  // Add intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src || img.src
          img.classList.add('loaded')
          imageObserver.unobserve(img)
        }
      })
    })
    
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img)
    })
  }
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link')
  fontLink.rel = 'preload'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
  fontLink.as = 'style'
  document.head.appendChild(fontLink)
  
  // Preload Razorpay script
  const razorpayLink = document.createElement('link')
  razorpayLink.rel = 'preload'
  razorpayLink.href = 'https://checkout.razorpay.com/v1/checkout.js'
  razorpayLink.as = 'script'
  document.head.appendChild(razorpayLink)
}

export const getDeviceInfo = () => ({
  isMobile: isMobileDevice(),
  isIOS: isIOSDevice(),
  isAndroid: isAndroidDevice(),
  screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
  screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  touchSupport: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
  maxTouchPoints: typeof window !== 'undefined' ? navigator.maxTouchPoints : 0
})

export const optimizeScrollPerformance = () => {
  // Add passive event listeners for better scroll performance
  const options = { passive: true }
  
  document.addEventListener('touchstart', () => {}, options)
  document.addEventListener('touchmove', () => {}, options)
  document.addEventListener('wheel', () => {}, options)
  document.addEventListener('scroll', () => {}, options)
}

export const initMobileOptimizations = () => {
  if (typeof window === 'undefined') return
  
  // Run optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeForMobile()
      optimizeImageLoading()
      optimizeScrollPerformance()
      preloadCriticalResources()
    })
  } else {
    optimizeForMobile()
    optimizeImageLoading()
    optimizeScrollPerformance()
    preloadCriticalResources()
  }
}