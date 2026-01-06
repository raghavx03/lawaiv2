// Notification System
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'welcome' | 'feature' | 'payment' | 'system'
  category: 'system' | 'user' | 'payment' | 'feature' | 'security'
  timestamp: string
  read: boolean
  actionUrl?: string
  actionText?: string
  userId: string
  metadata?: Record<string, any>
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  categories: {
    system: boolean
    payment: boolean
    feature: boolean
    security: boolean
  }
}

class NotificationManager {
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []
  private userId: string | null = null

  setUserId(userId: string) {
    this.userId = userId
    this.loadNotifications()
  }

  private async loadNotifications() {
    if (!this.userId) return

    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        this.notifications = data.notifications || []
        this.notifyListeners()
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  async createWelcomeNotification(userName: string) {
    if (!this.userId) return

    const notification: Omit<Notification, 'id'> = {
      title: `Welcome to LAW.AI, ${userName}! 🎉`,
      message: 'Your AI-powered legal assistant is ready. Explore our features to revolutionize your legal practice.',
      type: 'welcome',
      category: 'system',
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: '/dashboard',
      actionText: 'Get Started',
      userId: this.userId,
      metadata: {
        isWelcome: true,
        userName
      }
    }

    await this.addNotification(notification)
  }

  async createFeatureNotification(feature: string, message: string) {
    if (!this.userId) return

    const notification: Omit<Notification, 'id'> = {
      title: `${feature} Update`,
      message,
      type: 'feature',
      category: 'feature',
      timestamp: new Date().toISOString(),
      read: false,
      userId: this.userId,
      metadata: { feature }
    }

    await this.addNotification(notification)
  }

  async createPaymentNotification(type: 'success' | 'failed' | 'upgrade', plan?: string) {
    if (!this.userId) return

    let title = ''
    let message = ''
    let actionUrl = ''

    switch (type) {
      case 'success':
        title = 'Payment Successful! ✅'
        message = `Your ${plan} plan is now active. Enjoy unlimited access to all features.`
        actionUrl = '/dashboard'
        break
      case 'failed':
        title = 'Payment Failed ❌'
        message = 'Your payment could not be processed. Please try again or contact support.'
        actionUrl = '/dashboard'
        break
      case 'upgrade':
        title = 'Upgrade Available 🚀'
        message = 'Unlock more features with our premium plans. Get unlimited queries and priority support.'
        actionUrl = '/dashboard'
        break
    }

    const notification: Omit<Notification, 'id'> = {
      title,
      message,
      type: type === 'success' ? 'success' : type === 'failed' ? 'error' : 'info',
      category: 'payment',
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl,
      actionText: 'View Details',
      userId: this.userId,
      metadata: { paymentType: type, plan }
    }

    await this.addNotification(notification)
  }

  async createSystemNotification(title: string, message: string, type: 'info' | 'warning' | 'error' = 'info') {
    if (!this.userId) return

    const notification: Omit<Notification, 'id'> = {
      title,
      message,
      type,
      category: 'system',
      timestamp: new Date().toISOString(),
      read: false,
      userId: this.userId
    }

    await this.addNotification(notification)
  }

  private async addNotification(notification: Omit<Notification, 'id'>) {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      })

      if (response.ok) {
        const data = await response.json()
        this.notifications.unshift(data.notification)
        this.notifyListeners()
        
        // Show browser notification if permission granted
        this.showBrowserNotification(data.notification)
      }
    } catch (error) {
      console.error('Failed to create notification:', error)
    }
  }

  private showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    }
  }

  async markAsRead(notificationId: string) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })

      if (response.ok) {
        this.notifications = this.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
        this.notifyListeners()
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  async markAllAsRead() {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH'
      })

      if (response.ok) {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }))
        this.notifyListeners()
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId)
        this.notifyListeners()
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  getNotifications() {
    return this.notifications
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length
  }

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications))
  }

  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  // Real-time updates disabled to prevent console errors
  startRealTimeUpdates() {
    // SSE temporarily disabled
    return null
  }
}

export const notificationManager = new NotificationManager()

// Utility functions
export const formatNotificationTime = (timestamp: string): string => {
  const now = new Date()
  const notificationTime = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return notificationTime.toLocaleDateString()
}

export const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success': return '✅'
    case 'error': return '❌'
    case 'warning': return '⚠️'
    case 'welcome': return '🎉'
    case 'feature': return '🚀'
    case 'payment': return '💳'
    case 'system': return '🔧'
    default: return 'ℹ️'
  }
}

export const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success': return 'text-green-600 bg-green-50 border-green-200'
    case 'error': return 'text-red-600 bg-red-50 border-red-200'
    case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'welcome': return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'feature': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'payment': return 'text-indigo-600 bg-indigo-50 border-indigo-200'
    case 'system': return 'text-gray-600 bg-gray-50 border-gray-200'
    default: return 'text-blue-600 bg-blue-50 border-blue-200'
  }
}