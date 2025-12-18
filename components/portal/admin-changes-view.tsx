"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Clock, UserPlus, MessageSquare, ClipboardList, Briefcase, AlertTriangle,
  Mail, ExternalLink, RefreshCw, Filter, Download
} from "lucide-react"
import { getRecentChanges, getPendingApprovals, getUserById } from "@/lib/supabase/queries"
import type { RecentChange, User } from "@/lib/supabase/types"
import { showNotification } from "@/components/ui/notification"
import { logger } from "@/lib/utils/logger"
// Polling removed
import { formatDistanceToNow } from "date-fns"
import { AdminEmailSender } from "./admin-email-sender"

interface AdminChangesViewProps {
  onUserClick?: (userId: string) => void
}

export function AdminChangesView({ onUserClick }: AdminChangesViewProps) {
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<User[]>([])
  const [newActivity, setNewActivity] = useState<RecentChange[]>([])
  const [alerts, setAlerts] = useState<Array<{ id: string; type: string; message: string; userId?: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"recent" | "pending" | "activity" | "alerts">("recent")

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [changes, approvals] = await Promise.all([
        getRecentChanges(24),
        getPendingApprovals(),
      ])
      
      setRecentChanges(changes)
      setPendingApprovals(approvals)
      
      // Filter new activity (last 6 hours) with null checks
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
      const activity = Array.isArray(changes) ? changes.filter(c => 
        c && c.timestamp && new Date(c.timestamp) > sixHoursAgo && 
        (c.type === 'ucat' || c.type === 'portfolio' || c.type === 'comment')
      ) : []
      setNewActivity(activity)

      // Generate alerts
      const alertList: Array<{ id: string; type: string; message: string; userId?: string }> = []
      
      // Students without mentors with null checks
      if (Array.isArray(approvals) && approvals.length > 0) {
        approvals.forEach(user => {
          if (user && user.id) {
            alertList.push({
              id: `pending-${user.id}`,
              type: 'approval',
              message: `Pending approval: ${user.full_name || user.email || 'Unknown'}`,
              userId: user.id,
            })
          }
        })
      }

      // Recent signups needing attention
      const recentSignups = changes.filter(c => c.type === 'signup' && c.metadata?.approval_status === 'pending')
      recentSignups.forEach(signup => {
        alertList.push({
          id: signup.id,
          type: 'signup',
          message: `New ${signup.metadata?.role} signup requires approval: ${signup.userEmail}`,
          userId: signup.userId,
        })
      })

      setAlerts(alertList)
    } catch (error) {
      logger.error("Error loading changes data", error)
      showNotification("Failed to load changes data", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleExport = () => {
    const data = {
      recentChanges,
      pendingApprovals,
      newActivity,
      alerts,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-changes-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    showNotification("Changes exported successfully", "success")
  }

  const getChangeIcon = (type: RecentChange['type']) => {
    switch (type) {
      case 'signup':
        return <UserPlus size={16} className="text-blue-600" />
      case 'comment':
        return <MessageSquare size={16} className="text-green-600" />
      case 'ucat':
        return <ClipboardList size={16} className="text-purple-600" />
      case 'portfolio':
        return <Briefcase size={16} className="text-orange-600" />
      default:
        return <Clock size={16} className="text-slate-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-slate-900">Change Tracking</h2>
          <p className="text-sm text-slate-500 font-light mt-1">
            Monitor all system changes and pending actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="rounded-lg"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="rounded-lg"
          >
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4 rounded-lg">
          <TabsTrigger value="recent" className="rounded-lg">
            Recent Changes ({recentChanges.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg">
            Pending ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg">
            New Activity ({newActivity.length})
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-lg">
            Alerts ({alerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-4">
          <Card className="bg-white border-slate-200 rounded-lg">
            <CardContent className="pt-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw size={24} className="animate-spin text-slate-400" />
                    </div>
                  ) : recentChanges.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500 font-light">No recent changes</p>
                    </div>
                  ) : (
                    recentChanges.map(change => (
                      <div
                        key={change.id}
                        className="p-4 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          {getChangeIcon(change.type)}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-slate-900">
                                  {change.userName || change.userEmail}
                                </p>
                                <p className="text-sm text-slate-600 font-light mt-1">
                                  {change.description}
                                </p>
                                <p className="text-xs text-slate-500 font-light mt-1">
                                  {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {change.type}
                              </Badge>
                            </div>
                            {onUserClick && (
                              <div className="mt-2 flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onUserClick(change.userId)}
                                  className="text-xs h-7 rounded-lg"
                                >
                                  View
                                  <ExternalLink size={12} className="ml-1" />
                                </Button>
                                <a
                                  href={`mailto:${change.userEmail}`}
                                  className="text-xs text-blue-600 hover:underline font-light flex items-center gap-1"
                                >
                                  <Mail size={12} />
                                  Email
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card className="bg-white border-slate-200 rounded-lg">
            <CardContent className="pt-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {pendingApprovals.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500 font-light">No pending approvals</p>
                    </div>
                  ) : (
                    pendingApprovals.map(user => (
                      <div
                        key={user.id}
                        className="p-4 rounded-lg border border-amber-200 bg-amber-50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{user.full_name || user.email}</p>
                            <p className="text-sm text-slate-600 font-light mt-1">{user.email}</p>
                            <p className="text-xs text-slate-500 font-light mt-1">
                              Role: {user.role} • {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {onUserClick && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUserClick(user.id)}
                              className="rounded-lg"
                            >
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card className="bg-white border-slate-200 rounded-lg">
            <CardContent className="pt-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {newActivity.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500 font-light">No new activity</p>
                    </div>
                  ) : (
                    newActivity.map(activity => (
                      <div
                        key={activity.id}
                        className="p-4 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          {getChangeIcon(activity.type)}
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">
                              {activity.userName || activity.userEmail}
                            </p>
                            <p className="text-sm text-slate-600 font-light mt-1">
                              {activity.description}
                            </p>
                            <p className="text-xs text-slate-500 font-light mt-1">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card className="bg-white border-slate-200 rounded-lg">
            <CardContent className="pt-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500 font-light">No alerts</p>
                    </div>
                  ) : (
                    alerts.map(alert => (
                      <div
                        key={alert.id}
                        className="p-4 rounded-lg border border-amber-200 bg-amber-50 flex items-start gap-3"
                      >
                        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{alert.message}</p>
                          {alert.userId && onUserClick && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onUserClick(alert.userId!)}
                              className="mt-2 text-xs h-7 rounded-lg"
                            >
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

