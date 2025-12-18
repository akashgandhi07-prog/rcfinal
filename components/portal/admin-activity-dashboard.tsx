"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  UserPlus, MessageSquare, ClipboardList, Briefcase, User as UserIcon, CheckCircle2, XCircle, 
  Mail, ExternalLink, RefreshCw, Clock, Filter 
} from "lucide-react"
import { getRecentChanges, getPendingApprovals, updateUser, getUserById } from "@/lib/supabase/queries"
import type { RecentChange, User } from "@/lib/supabase/types"
import { showNotification } from "@/components/ui/notification"
import { logger } from "@/lib/utils/logger"
// Activity logging removed
// Polling removed
import { formatDistanceToNow } from "date-fns"
import { AdminEmailSender } from "./admin-email-sender"
import { useRouter } from "next/navigation"

interface AdminActivityDashboardProps {
  onUserClick?: (userId: string) => void
}

export function AdminActivityDashboard({ onUserClick }: AdminActivityDashboardProps) {
  const router = useRouter()
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<number>(24)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [changes, approvals] = await Promise.all([
        getRecentChanges(timeRange),
        getPendingApprovals(),
      ])
      setRecentChanges(changes)
      setPendingApprovals(approvals)
    } catch (error) {
      logger.error("Error loading activity data", error)
      showNotification("Failed to load activity data", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [timeRange])

  const handleApprove = async (userId: string) => {
    try {
      const updated = await updateUser(userId, {
        approval_status: "approved",
      })

      if (updated) {
        showNotification("User approved successfully", "success")
        await loadData()
      } else {
        showNotification("Failed to approve user", "error")
      }
    } catch (error) {
      logger.error("Error approving user", error, { userId })
      showNotification("Failed to approve user", "error")
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const updated = await updateUser(userId, {
        approval_status: "rejected",
      })

      if (updated) {
        showNotification("User rejected", "success")
        await loadData()
      } else {
        showNotification("Failed to reject user", "error")
      }
    } catch (error) {
      logger.error("Error rejecting user", error, { userId })
      showNotification("Failed to reject user", "error")
    }
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
      case 'profile':
        return <UserIcon size={16} className="text-slate-600" />
      case 'approval':
        return <CheckCircle2 size={16} className="text-emerald-600" />
      default:
        return <Clock size={16} className="text-slate-400" />
    }
  }

  const getChangeColor = (type: RecentChange['type']) => {
    switch (type) {
      case 'signup':
        return 'bg-blue-50 border-blue-200'
      case 'comment':
        return 'bg-green-50 border-green-200'
      case 'ucat':
        return 'bg-purple-50 border-purple-200'
      case 'portfolio':
        return 'bg-orange-50 border-orange-200'
      case 'profile':
        return 'bg-slate-50 border-slate-200'
      case 'approval':
        return 'bg-emerald-50 border-emerald-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  const filteredChanges = filterType === "all" 
    ? recentChanges 
    : recentChanges.filter(c => c.type === filterType)

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-slate-900">Activity Dashboard</h2>
          <p className="text-sm text-slate-500 font-light mt-1">
            Monitoring of all platform activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value={1}>Last hour</option>
            <option value={24}>Last 24 hours</option>
            <option value={168}>Last week</option>
          </select>
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
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="bg-amber-50 border-amber-200 rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-amber-900 flex items-center gap-2">
              <Clock size={20} className="text-amber-600" />
              Pending Approvals ({pendingApprovals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{user.full_name || user.email}</p>
                    <p className="text-sm text-slate-600 font-light">{user.email}</p>
                    <p className="text-xs text-slate-500 font-light mt-1">
                      Role: {user.role} • Signed up {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(user.id)}
                      className="rounded-lg text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle size={16} className="mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(user.id)}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 size={16} className="mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Changes */}
      <Card className="bg-white border-slate-200 rounded-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
              <Filter size={20} className="text-slate-600" />
              Recent Changes ({filteredChanges.length})
            </CardTitle>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
              >
                <option value="all">All Types</option>
                <option value="signup">Signups</option>
                <option value="comment">Comments</option>
                <option value="ucat">UCAT Mocks</option>
                <option value="portfolio">Portfolio</option>
                <option value="profile">Profile Updates</option>
                <option value="approval">Approvals</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="animate-spin text-slate-400" />
            </div>
          ) : filteredChanges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 font-light">No recent changes</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredChanges.map(change => (
                  <div
                    key={change.id}
                    className={`p-4 rounded-lg border ${getChangeColor(change.type)} hover:shadow-sm transition-shadow cursor-pointer`}
                    onClick={() => {
                      if (onUserClick && change.userId) {
                        onUserClick(change.userId)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getChangeIcon(change.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {change.userName || change.userEmail}
                            </p>
                            <p className="text-sm text-slate-600 font-light mt-1">
                              {change.description}
                            </p>
                            <p className="text-xs text-slate-500 font-light mt-1">
                              {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {change.type}
                            </Badge>
                            {change.type === 'signup' && change.metadata?.approval_status === 'pending' && (
                              <Badge className="bg-amber-500 text-white text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                        {onUserClick && (
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onUserClick(change.userId)
                              }}
                              className="text-xs h-7 rounded-lg"
                            >
                              View Profile
                              <ExternalLink size={12} className="ml-1" />
                            </Button>
                            <a
                              href={`mailto:${change.userEmail}`}
                              onClick={(e) => e.stopPropagation()}
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
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

