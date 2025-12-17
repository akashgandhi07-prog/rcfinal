"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, Filter, Download, RefreshCw } from "lucide-react"
import { getActivityLogs, getLoginAttempts, getUserActivitySummary } from "@/lib/supabase/queries"
import type { ActivityLog, LoginAttempt } from "@/lib/supabase/types"
import { showNotification } from "@/components/ui/notification"

export function ActivityLogViewer() {
  const [activeTab, setActiveTab] = useState<"activities" | "logins" | "summary">("activities")
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([])
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getUserActivitySummary>>>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filters
  const [userIdFilter, setUserIdFilter] = useState("")
  const [actionTypeFilter, setActionTypeFilter] = useState("")
  const [resourceTypeFilter, setResourceTypeFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const [successFilter, setSuccessFilter] = useState<string>("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === "activities") {
        const data = await getActivityLogs({
          limit: 100,
          userId: userIdFilter || undefined,
          actionType: actionTypeFilter || undefined,
          resourceType: resourceTypeFilter || undefined,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
        })
        setActivities(data)
      } else if (activeTab === "logins") {
        const data = await getLoginAttempts({
          limit: 100,
          email: emailFilter || undefined,
          success: successFilter ? successFilter === "true" : undefined,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
        })
        setLoginAttempts(data)
      } else if (activeTab === "summary") {
        const data = await getUserActivitySummary()
        setSummary(data)
      }
    } catch (error) {
      console.error("Error loading activity data:", error)
      showNotification("Failed to load activity data", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    })
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "login":
        return "text-green-600"
      case "logout":
        return "text-blue-600"
      case "create":
        return "text-emerald-600"
      case "update":
        return "text-yellow-600"
      case "delete":
        return "text-red-600"
      default:
        return "text-slate-600"
    }
  }

  const exportToCSV = () => {
    let csv = ""
    let headers: string[] = []
    let rows: string[][] = []

    if (activeTab === "activities") {
      headers = ["Date", "User Email", "Action", "Resource Type", "Resource ID", "Description", "IP Address"]
      rows = activities.map((log) => [
        formatDate(log.created_at),
        log.user_email || "Unknown",
        log.action_type,
        log.resource_type,
        log.resource_id || "",
        log.description || "",
        log.ip_address || "",
      ])
    } else if (activeTab === "logins") {
      headers = ["Date", "Email", "Success", "IP Address"]
      rows = loginAttempts.map((attempt) => [
        formatDate(attempt.created_at),
        attempt.email,
        attempt.success ? "Yes" : "No",
        attempt.ip_address || "",
      ])
    }

    csv = headers.join(",") + "\n" + rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    showNotification("Activity log exported successfully", "success")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-slate-900 font-light">Activity Logs</h2>
          <p className="text-sm text-slate-600 font-light mt-1">Monitor all user activities and login attempts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
            className="rounded-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="rounded-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="rounded-lg">
          <TabsTrigger value="activities" className="rounded-lg">Activities</TabsTrigger>
          <TabsTrigger value="logins" className="rounded-lg">Login Attempts</TabsTrigger>
          <TabsTrigger value="summary" className="rounded-lg">User Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-light">Filter Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">Action Type</Label>
                  <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Actions</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">Resource Type</Label>
                  <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="All resources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Resources</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="ucat_mock">UCAT Mock</SelectItem>
                      <SelectItem value="portfolio_activity">Portfolio Activity</SelectItem>
                      <SelectItem value="university_strategy">University Strategy</SelectItem>
                      <SelectItem value="mentor_comment">Mentor Comment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">Start Date</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">End Date</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <Button onClick={loadData} className="mt-4 rounded-lg" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Loading activities...
                        </TableCell>
                      </TableRow>
                    ) : activities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          No activities found
                        </TableCell>
                      </TableRow>
                    ) : (
                      activities.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm font-light">
                            {formatDate(log.created_at)}
                          </TableCell>
                          <TableCell className="text-sm font-light">
                            {log.user_email || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm font-medium ${getActionColor(log.action_type)}`}>
                              {log.action_type}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm font-light">
                            {log.resource_type}
                            {log.resource_id && (
                              <span className="text-xs text-slate-400 ml-1">
                                ({log.resource_id.slice(0, 8)}...)
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-light max-w-md truncate">
                            {log.description || "-"}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 font-light">
                            {log.ip_address || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logins" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-light">Filter Login Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">Email</Label>
                  <Input
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    placeholder="Filter by email"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">Status</Label>
                  <Select value={successFilter} onValueChange={setSuccessFilter}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="true">Successful</SelectItem>
                      <SelectItem value="false">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">Start Date</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">End Date</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <Button onClick={loadData} className="mt-4 rounded-lg" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          Loading login attempts...
                        </TableCell>
                      </TableRow>
                    ) : loginAttempts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          No login attempts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      loginAttempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell className="text-sm font-light">
                            {formatDate(attempt.created_at)}
                          </TableCell>
                          <TableCell className="text-sm font-light">{attempt.email}</TableCell>
                          <TableCell>
                            <span
                              className={`text-sm font-medium ${
                                attempt.success ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {attempt.success ? "Success" : "Failed"}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 font-light">
                            {attempt.ip_address || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Email</TableHead>
                      <TableHead>Total Activities</TableHead>
                      <TableHead>Login Count</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                          Loading summary...
                        </TableCell>
                      </TableRow>
                    ) : summary.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                          No activity data found
                        </TableCell>
                      </TableRow>
                    ) : (
                      summary.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm font-light">
                            {item.user_email || "Unknown"}
                          </TableCell>
                          <TableCell className="text-sm font-light">{item.total_activities}</TableCell>
                          <TableCell className="text-sm font-light">{item.login_count}</TableCell>
                          <TableCell className="text-sm font-light">
                            {item.last_activity ? formatDate(item.last_activity) : "-"}
                          </TableCell>
                          <TableCell className="text-sm font-light">
                            {item.last_login ? formatDate(item.last_login) : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

