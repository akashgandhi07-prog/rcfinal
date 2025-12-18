"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Video, 
  FileText, 
  GraduationCap, 
  Search, 
  Download, 
  ExternalLink,
  File,
  PlayCircle
} from "lucide-react"
import { getResources, getCurrentUser } from "@/lib/supabase/queries"
import type { Resource, ResourceType, TargetCourse } from "@/lib/supabase/types"
import { showNotification } from "@/components/ui/notification"

interface ResourceLibraryViewProps {
  viewMode: "student" | "parent" | "mentor"
  studentId?: string
}

export function ResourceLibraryView({ viewMode, studentId }: ResourceLibraryViewProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ResourceType>("knowledge_base")
  const [searchQuery, setSearchQuery] = useState("")
  const [userCourse, setUserCourse] = useState<TargetCourse | null>(null)

  useEffect(() => {
    loadResources()
  }, [activeTab, studentId])

  useEffect(() => {
    filterResources()
  }, [resources, searchQuery, activeTab])

  const loadResources = async () => {
    setIsLoading(true)
    try {
      const user = await getCurrentUser()
      if (user) {
        setUserCourse(user.target_course)
      }

      // For parents/mentors viewing a student, we need to get the student's course
      // For now, we'll use the current user's course or the student's course if available
      const course = user?.target_course || userCourse

      const data = await getResources({
        resourceType: activeTab,
        course: course || undefined,
      })
      
      setResources(data)
    } catch (error) {
      console.error("Error loading resources:", error)
      showNotification("Failed to load resources", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const filterResources = () => {
    let filtered = resources

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(query) ||
          resource.description?.toLowerCase().includes(query) ||
          resource.searchable_content?.toLowerCase().includes(query) ||
          resource.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          resource.university_name?.toLowerCase().includes(query)
      )
    }

    setFilteredResources(filtered)
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case "knowledge_base":
        return <BookOpen size={20} className="text-[#D4AF37]" />
      case "video_library":
        return <Video size={20} className="text-[#D4AF37]" />
      case "template_library":
        return <FileText size={20} className="text-[#D4AF37]" />
      case "university_guides":
        return <GraduationCap size={20} className="text-[#D4AF37]" />
    }
  }

  const handleDownload = (resource: Resource) => {
    if (resource.file_url) {
      window.open(resource.file_url, "_blank")
    } else if (resource.external_url) {
      window.open(resource.external_url, "_blank")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-500 font-light">Loading resources...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-slate-900 mb-2">Resource Library</h1>
          <p className="text-sm text-slate-600 font-light">
            Access guides, templates, videos, and university-specific resources
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        <Input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-none border-slate-300 bg-white"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ResourceType)}>
        <TabsList className="bg-white border border-slate-200 rounded-none">
          <TabsTrigger value="knowledge_base" className="rounded-none">
            <BookOpen size={16} className="mr-2" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="video_library" className="rounded-none">
            <Video size={16} className="mr-2" />
            Video Library
          </TabsTrigger>
          <TabsTrigger value="template_library" className="rounded-none">
            <FileText size={16} className="mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="university_guides" className="rounded-none">
            <GraduationCap size={16} className="mr-2" />
            University Guides
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge_base" className="mt-6">
          <ResourceGrid resources={filteredResources} onDownload={handleDownload} />
        </TabsContent>

        <TabsContent value="video_library" className="mt-6">
          <ResourceGrid resources={filteredResources} onDownload={handleDownload} />
        </TabsContent>

        <TabsContent value="template_library" className="mt-6">
          <ResourceGrid resources={filteredResources} onDownload={handleDownload} />
        </TabsContent>

        <TabsContent value="university_guides" className="mt-6">
          <ResourceGrid resources={filteredResources} onDownload={handleDownload} />
        </TabsContent>
      </Tabs>

      {filteredResources.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-slate-500 font-light">
            {searchQuery ? "No resources found matching your search." : "No resources available in this category."}
          </p>
        </div>
      )}
    </div>
  )
}

interface ResourceGridProps {
  resources: Resource[]
  onDownload: (resource: Resource) => void
}

function ResourceGrid({ resources, onDownload }: ResourceGridProps) {
  if (resources.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} onDownload={onDownload} />
      ))}
    </div>
  )
}

interface ResourceCardProps {
  resource: Resource
  onDownload: (resource: Resource) => void
}

function ResourceCard({ resource, onDownload }: ResourceCardProps) {
  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case "knowledge_base":
        return <BookOpen size={24} className="text-[#D4AF37]" />
      case "video_library":
        return <PlayCircle size={24} className="text-[#D4AF37]" />
      case "template_library":
        return <FileText size={24} className="text-[#D4AF37]" />
      case "university_guides":
        return <GraduationCap size={24} className="text-[#D4AF37]" />
    }
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card className="bg-white border-slate-200 rounded-none hover:shadow-lg transition-shadow">
      <CardHeader className="border-b border-slate-200 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getResourceIcon(resource.resource_type)}
            <CardTitle className="text-base font-light text-slate-900 line-clamp-2">
              {resource.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {resource.description && (
          <p className="text-sm text-slate-600 font-light line-clamp-3">
            {resource.description}
          </p>
        )}

        {resource.university_name && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-light">
              {resource.university_name}
            </Badge>
          </div>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs font-light">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-light">
            {resource.file_size && formatFileSize(resource.file_size)}
            {resource.file_type && ` • ${resource.file_type.split('/')[1]?.toUpperCase() || resource.file_type}`}
          </div>
          <Button
            onClick={() => onDownload(resource)}
            variant="outline"
            size="sm"
            className="rounded-none border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-light text-xs"
          >
            {resource.external_url ? (
              <>
                <ExternalLink size={14} className="mr-1" />
                Open
              </>
            ) : (
              <>
                <Download size={14} className="mr-1" />
                Download
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

