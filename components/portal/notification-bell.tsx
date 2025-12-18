"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
  getUnreadCount,
  type Notification,
} from "@/lib/utils/notifications"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface NotificationBellProps {
  userId?: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const loadNotifications = () => {
    const allNotifications = getNotifications()
    const filtered = userId 
      ? allNotifications.filter(n => !n.userId || n.userId === userId)
      : allNotifications
    setNotifications(filtered)
    setUnreadCount(getUnreadCount())
  }

  useEffect(() => {
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id)
      loadNotifications()
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      setIsOpen(false)
    }
  }

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead()
    loadNotifications()
  }

  const handleDelete = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNotification(notificationId)
    loadNotifications()
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return '💬'
      case 'update':
        return '📝'
      case 'deadline':
        return '⏰'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return 'bg-blue-50 border-blue-200'
      case 'update':
        return 'bg-green-50 border-green-200'
      case 'deadline':
        return 'bg-amber-50 border-amber-200'
      case 'success':
        return 'bg-emerald-50 border-emerald-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-lg hover:bg-slate-100"
        >
          <Bell size={20} className="text-slate-700" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-sm font-medium text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 font-light">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-light mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-light">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </span>
                        <button
                          onClick={(e) => handleDelete(notification.id, e)}
                          className="text-xs text-slate-400 hover:text-red-600 font-light"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-slate-600 hover:text-slate-900"
              onClick={() => {
                setIsOpen(false)
                router.push('/portal?view=settings')
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

