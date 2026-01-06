// Mobile detection and optimization utilities
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768
}

export const optimizeForMobile = () => {
  if (!isMobileDevice()) return
  
  // Prevent zoom on input focus
  const viewport = document.querySelector('meta[name=viewport]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
  }
  
  // Add mobile class to body
  document.body.classList.add('mobile-device')
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
  }
})