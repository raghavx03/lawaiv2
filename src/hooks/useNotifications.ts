import { useState, useEffect } from 'react'
import { notificationManager, type Notification } from '@/lib/notifications'
import { useAuth } from '@/context/AuthContext'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    // Set user ID and load notifications
    notificationManager.setUserId(user.id)
    
    // Subscribe to notification updates
    const unsubscribe = notificationManager.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications)
      setLoading(false)
    })

    // Start real-time updates
    const eventSource = notificationManager.startRealTimeUpdates()

    // Request notification permission only on user interaction
    // notificationManager.requestNotificationPermission()

    return () => {
      unsubscribe()
      eventSource?.close()
    }
  }, [user])

  const markAsRead = async (notificationId: string) => {
    await notificationManager.markAsRead(notificationId)
  }

  const markAllAsRead = async () => {
    await notificationManager.markAllAsRead()
  }

  const deleteNotification = async (notificationId: string) => {
    await notificationManager.deleteNotification(notificationId)
  }

  const createWelcomeNotification = async (userName: string) => {
    await notificationManager.createWelcomeNotification(userName)
  }

  const createPaymentNotification = async (type: 'success' | 'failed' | 'upgrade', plan?: string) => {
    await notificationManager.createPaymentNotification(type, plan)
  }

  const createFeatureNotification = async (feature: string, message: string) => {
    await notificationManager.createFeatureNotification(feature, message)
  }

  const createSystemNotification = async (title: string, message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    await notificationManager.createSystemNotification(title, message, type)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createWelcomeNotification,
    createPaymentNotification,
    createFeatureNotification,
    createSystemNotification
  }
}