'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useNavigationFix() {
  const router = useRouter()

  useEffect(() => {
    // Check if we came from Google OAuth and fix the history
    const currentUrl = window.location.href
    const referrer = document.referrer
    
    // If we're on dashboard and came from Google OAuth, replace the history
    if (currentUrl.includes('/dashboard') && 
        (referrer.includes('accounts.google.com') || 
         referrer.includes('oauth') || 
         window.history.length <= 2)) {
      
      // Replace the current history entry to point to home instead of OAuth
      window.history.replaceState(
        { fromAuth: true }, 
        '', 
        '/dashboard'
      )
      
      // Push a home state so back button goes to landing page
      window.history.pushState(
        { page: 'dashboard' }, 
        '', 
        '/dashboard'
      )
      
      // Add event listener for back button
      const handlePopState = (event: PopStateEvent) => {
        if (event.state?.fromAuth || window.history.length <= 1) {
          // Navigate to home instead of going back to OAuth
          router.replace('/')
        }
      }
      
      window.addEventListener('popstate', handlePopState)
      
      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [router])
}