"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Briefcase, ClipboardList, MessageSquare, Calendar, TrendingUp,
  Plus, ExternalLink, Activity
} from "lucide-react"
import { 
  getPortfolioActivities, 
  getUCATMocks, 
  getMentorComments,
  getUserById 
} from "@/lib/supabase/queries"
import type { User } from "@/lib/supabase/types"
import { formatDistanceToNow } from "date-fns"
import { logger } from "@/lib/utils/logger"
// Polling removed

interface DashboardWidgetsProps {
  studentId?: string
  viewMode: "student" | "parent" | "mentor"
}

export function DashboardWidgets({ studentId, viewMode }: DashboardWidgetsProps) {
  const [stats, setStats] = useState({
    portfolioCount: 0,
    ucatCount: 0,
    commentCount: 0,
    portfolioCompleteness: 0,
    ucatAverage: 0,
  })
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string
    type: string
    title: string
    timestamp: Date
    url?: string
  }>>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = async () => {
    if (!studentId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      const [portfolio, ucat, comments] = await Promise.all([
        getPortfolioActivities(studentId),
        getUCATMocks(studentId),
        getMentorComments(studentId),
      ])

      // Calculate stats with null checks
      const portfolioCount = Array.isArray(portfolio) ? portfolio.length : 0
      const ucatCount = Array.isArray(ucat) ? ucat.length : 0
      const commentCount = Array.isArray(comments) ? comments.length : 0

      // Calculate portfolio completeness (aim for 20+ items across categories)
      const portfolioCompleteness = Math.min(100, (portfolioCount / 20) * 100)

      // Calculate UCAT average with null checks
      const scores = Array.isArray(ucat) 
        ? ucat.map(m => m?.total_score).filter((s): s is number => s !== null && s !== undefined)
        : []
      const ucatAverage = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0

      setStats({
        portfolioCount,
        ucatCount,
        commentCount,
        portfolioCompleteness,
        ucatAverage: Math.round(ucatAverage),
      })

      // Build recent activity timeline
      const activities: Array<{
        id: string
        type: string
        title: string
        timestamp: Date
        url?: string
      }> = []

      // Add recent portfolio items with null checks
      if (Array.isArray(portfolio)) {
        portfolio.slice(0, 5).forEach(item => {
          if (item && item.id && item.category && item.organization) {
            activities.push({
              id: `portfolio-${item.id}`,
              type: 'portfolio',
              title: `Added ${item.category}: ${item.organization}`,
              timestamp: new Date(item.created_at || Date.now()),
              url: '#portfolio',
            })
          }
        })
      }

      // Add recent UCAT mocks with null checks
      if (Array.isArray(ucat)) {
        ucat.slice(0, 5).forEach(mock => {
          if (mock && mock.id) {
            activities.push({
              id: `ucat-${mock.id}`,
              type: 'ucat',
              title: `UCAT mock: ${mock.mock_name || 'Unknown'} - ${mock.total_score || 'N/A'}`,
              timestamp: new Date(mock.created_at || Date.now()),
              url: '#ucat',
            })
          }
        })
      }

      // Add recent comments with null checks
      if (Array.isArray(comments)) {
        comments.slice(0, 5).forEach(comment => {
          if (comment && comment.id) {
            activities.push({
              id: `comment-${comment.id}`,
              type: 'comment',
              title: `New comment from ${comment.mentor?.full_name || 'mentor'}`,
              timestamp: new Date(comment.created_at || Date.now()),
              url: '#comments',
            })
          }
        })
      }

      // Sort by timestamp and take latest 10
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setRecentActivity(activities.slice(0, 10))
    } catch (error) {
      logger.error("Error loading dashboard stats", error, { studentId })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    
    const load = async () => {
      await loadStats()
      if (!mounted) return
    }
    
    load()
    
    return () => {
      mounted = false
    }
  }, [studentId])

  if (!studentId) {
    return null
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'portfolio':
        return <Briefcase size={14} className="text-orange-600" />
      case 'ucat':
        return <ClipboardList size={14} className="text-purple-600" />
      case 'comment':
        return <MessageSquare size={14} className="text-green-600" />
      default:
        return <Activity size={14} className="text-slate-400" />
    }
  }

  // Calculate days until application deadline (Oct 15)
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const deadline = new Date(currentYear, 9, 15) // October is month 9 (0-indexed)
  if (deadline < currentDate) {
    deadline.setFullYear(currentYear + 1) // Next year if deadline has passed
  }
  const daysUntilDeadline = Math.ceil((deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 rounded-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-light mb-1">Portfolio Items</p>
                <p className="text-2xl font-light text-slate-900">{stats.portfolioCount}</p>
                <Progress 
                  value={stats.portfolioCompleteness} 
                  className="mt-2 h-1.5" 
                />
                <p className="text-xs text-slate-500 font-light mt-1">
                  {Math.round(stats.portfolioCompleteness)}% complete
                </p>
              </div>
              <Briefcase size={32} className="text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-light mb-1">UCAT Mocks</p>
                <p className="text-2xl font-light text-slate-900">{stats.ucatCount}</p>
                {stats.ucatAverage > 0 && (
                  <>
                    <p className="text-xs text-slate-600 font-light mt-2">Avg Score</p>
                    <p className="text-lg font-medium text-slate-900">{stats.ucatAverage}</p>
                  </>
                )}
              </div>
              <ClipboardList size={32} className="text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-light mb-1">Mentor Comments</p>
                <p className="text-2xl font-light text-slate-900">{stats.commentCount}</p>
                <p className="text-xs text-slate-600 font-light mt-2">Total feedback</p>
              </div>
              <MessageSquare size={32} className="text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 rounded-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-light mb-1">Days to Deadline</p>
                <p className="text-2xl font-light text-slate-900">{daysUntilDeadline}</p>
                <p className="text-xs text-slate-600 font-light mt-2">Application deadline</p>
              </div>
              <Calendar size={32} className="text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card className="bg-white border-slate-200 rounded-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-light text-slate-900 flex items-center gap-2">
              <Activity size={20} className="text-slate-600" />
              Recent Activity
            </CardTitle>
            {viewMode === "student" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.hash = '#portfolio'}
                  className="rounded-lg text-xs"
                >
                  <Plus size={14} className="mr-1" />
                  Add Activity
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.hash = '#ucat'}
                  className="rounded-lg text-xs"
                >
                  <Plus size={14} className="mr-1" />
                  Add Mock
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Activity size={24} className="animate-pulse text-slate-400" />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 font-light">No recent activity</p>
              {viewMode === "student" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.hash = '#portfolio'}
                  className="mt-4 rounded-lg"
                >
                  Get Started
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 font-light">{activity.title}</p>
                    <p className="text-xs text-slate-500 font-light mt-1">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  {activity.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.location.hash = activity.url!
                      }}
                      className="text-xs h-7 rounded-lg"
                    >
                      View
                      <ExternalLink size={12} className="ml-1" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

