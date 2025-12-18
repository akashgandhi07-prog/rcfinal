export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'comment' | 'update' | 'deadline'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string // URL to navigate to when clicked
  userId?: string // User this notification is for
  metadata?: Record<string, unknown> // Additional data
}

// Store notifications in localStorage for now (can be migrated to database later)
const STORAGE_KEY = 'regents_notifications'

export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const notifications = JSON.parse(stored)
    return notifications.map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp),
    }))
  } catch (error) {
    console.error('Error loading notifications:', error)
    return []
  }
}

export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch (error) {
    console.error('Error saving notifications:', error)
  }
}

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
  const notifications = getNotifications()
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    read: false,
  }
  
  notifications.unshift(newNotification)
  // Keep only last 50 notifications
  const trimmed = notifications.slice(0, 50)
  saveNotifications(trimmed)
  
  return newNotification
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getNotifications()
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  )
  saveNotifications(updated)
}

export function markAllNotificationsAsRead(): void {
  const notifications = getNotifications()
  const updated = notifications.map(n => ({ ...n, read: true }))
  saveNotifications(updated)
}

export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications()
  const filtered = notifications.filter(n => n.id !== notificationId)
  saveNotifications(filtered)
}

export function clearAllNotifications(): void {
  saveNotifications([])
}

export function getUnreadCount(): number {
  const notifications = getNotifications()
  return notifications.filter(n => !n.read).length
}

export function getUnreadNotifications(): Notification[] {
  const notifications = getNotifications()
  return notifications.filter(n => !n.read)
}

