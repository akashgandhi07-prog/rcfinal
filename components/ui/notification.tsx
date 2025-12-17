"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "./button"

export type NotificationType = "success" | "error" | "info" | "warning"

export interface Notification {
  id: string
  message: string
  type: NotificationType
  duration?: number
}

interface NotificationProps {
  notification: Notification
  onClose: (id: string) => void
}

function NotificationItem({ notification, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(notification.id), 300)
    }, notification.duration || 5000)

    return () => clearTimeout(timer)
  }, [notification, onClose])

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  }

  const Icon = icons[notification.type]

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${colors[notification.type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <p className="flex-1 text-sm font-light">{notification.message}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 hover:bg-transparent"
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose(notification.id), 300)
          }}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

let notificationIdCounter = 0
const notifications: Notification[] = []
const listeners: Array<(notifications: Notification[]) => void> = []

export function showNotification(
  message: string,
  type: NotificationType = "info",
  duration?: number
): string {
  const id = `notification-${++notificationIdCounter}`
  const notification: Notification = { id, message, type, duration }
  notifications.push(notification)
  listeners.forEach((listener) => listener([...notifications]))
  return id
}

export function removeNotification(id: string) {
  const index = notifications.findIndex((n) => n.id === id)
  if (index > -1) {
    notifications.splice(index, 1)
    listeners.forEach((listener) => listener([...notifications]))
  }
}

export function NotificationContainer() {
  const [currentNotifications, setCurrentNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const listener = (notifications: Notification[]) => {
      setCurrentNotifications(notifications)
    }
    listeners.push(listener)
    setCurrentNotifications([...notifications])

    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {currentNotifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            notification={notification}
            onClose={removeNotification}
          />
        </div>
      ))}
    </div>
  )
}

