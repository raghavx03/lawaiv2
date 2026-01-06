'use client'

import { createContext, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useNotifications } from '@/hooks/useNotifications'

const NotificationContext = createContext<any>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const { createWelcomeNotification } = useNotifications()

  useEffect(() => {
    if (user && profile) {
      // Check if this is a new login (you can implement this logic)
      const lastLogin = localStorage.getItem(`lastLogin_${user.id}`)
      const currentTime = new Date().getTime()
      
      if (!lastLogin || currentTime - parseInt(lastLogin) > 24 * 60 * 60 * 1000) {
        // Create welcome notification for new login or after 24 hours
        const userName = profile.fullName || user.email?.split('@')[0] || 'User'
        createWelcomeNotification(userName)
        localStorage.setItem(`lastLogin_${user.id}`, currentTime.toString())
      }
    }
  }, [user, profile, createWelcomeNotification])

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }
  return context
}