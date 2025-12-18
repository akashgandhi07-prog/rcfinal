"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Upload, X, File, ExternalLink } from "lucide-react"
import { getAllResourcesForAdmin, createResource, updateResource, deleteResource, uploadResourceFile } from "@/lib/supabase/queries"
import type { Resource, ResourceType, ResourceCreate, ResourceUpdate } from "@/lib/supabase/types"
import { showNotification } from "@/components/ui/notification"

export function AdminResourceManager() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState<ResourceCreate>({
    title: "",
    description: "",
    resource_type: "knowledge_base",
    file_url: null,
    file_name: null,
    file_size: null,
    file_type: null,
    external_url: null,
    thumbnail_url: null,
    visible_to_medicine: false,
    visible_to_dentistry: false,
    visible_to_veterinary: false,
    tags: [],
    searchable_content: "",
    university_name: null,
  })

  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    setIsLoading(true)
    try {
      const data = await getAllResourcesForAdmin()
      setResources(data)
    } catch (error) {
      console.error("Error loading resources:", error)
      showNotification("Failed to load resources", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await uploadResourceFile(file)
      if (result) {
        setFormData({
          ...formData,
          file_url: result.url,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        })
        showNotification("File uploaded successfully", "success")
      } else {
        showNotification("Failed to upload file", "error")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      showNotification("Failed to upload file", "error")
    } finally {
      setUploading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    })
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showNotification("Title is required", "error")
      return
    }

    try {
      if (editingResource) {
        const updated = await updateResource(editingResource.id, formData as ResourceUpdate)
        if (updated) {
          showNotification("Resource updated successfully", "success")
          setShowDialog(false)
          resetForm()
          loadResources()
        } else {
          showNotification("Failed to update resource", "error")
        }
      } else {
        const created = await createResource(formData)
        if (created) {
          showNotification("Resource created successfully", "success")
          setShowDialog(false)
          resetForm()
          loadResources()
        } else {
          showNotification("Failed to create resource", "error")
        }
      }
    } catch (error) {
      console.error("Error saving resource:", error)
      showNotification("Failed to save resource", "error")
    }
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description || "",
      resource_type: resource.resource_type,
      file_url: resource.file_url,
      file_name: resource.file_name,
      file_size: resource.file_size,
      file_type: resource.file_type,
      external_url: resource.external_url,
      thumbnail_url: resource.thumbnail_url,
      visible_to_medicine: resource.visible_to_medicine,
      visible_to_dentistry: resource.visible_to_dentistry,
      visible_to_veterinary: resource.visible_to_veterinary,
      tags: resource.tags || [],
      searchable_content: resource.searchable_content || "",
      university_name: resource.university_name,
    })
    setShowDialog(true)
  }

  const handleDelete = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) {
      return
    }

    try {
      const success = await deleteResource(resourceId)
      if (success) {
        showNotification("Resource deleted successfully", "success")
        loadResources()
      } else {
        showNotification("Failed to delete resource", "error")
      }
    } catch (error) {
      console.error("Error deleting resource:", error)
      showNotification("Failed to delete resource", "error")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      resource_type: "knowledge_base",
      file_url: null,
      file_name: null,
      file_size: null,
      file_type: null,
      external_url: null,
      thumbnail_url: null,
      visible_to_medicine: false,
      visible_to_dentistry: false,
      visible_to_veterinary: false,
      tags: [],
      searchable_content: "",
      university_name: null,
    })
    setEditingResource(null)
    setTagInput("")
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-slate-900">Resource Library Management</h2>
          <p className="text-sm text-slate-600 font-light mt-1">
            Manage resources for students (Knowledge Base, Videos, Templates, University Guides)
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open)
          if (!open) {
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setShowDialog(true)
              }}
              className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-none uppercase tracking-widest text-xs font-light"
            >
              <Plus size={14} className="mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingResource ? "Edit Resource" : "Add New Resource"}
              </DialogTitle>
              <DialogDescription>
                Upload files or add external links. Resources can be visible to specific courses.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Resource Type *</Label>
                <Select
                  value={formData.resource_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, resource_type: value as ResourceType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="knowledge_base">Knowledge Base</SelectItem>
                    <SelectItem value="video_library">Video Library</SelectItem>
                    <SelectItem value="template_library">Template Library</SelectItem>
                    <SelectItem value="university_guides">University Guides</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Resource title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Resource description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Searchable Content</Label>
                <Textarea
                  value={formData.searchable_content || ""}
                  onChange={(e) => setFormData({ ...formData, searchable_content: e.target.value })}
                  placeholder="Full text content for search (FAQ answers, guide content, etc.)"
                  rows={5}
                />
              </div>

              {formData.resource_type === "university_guides" && (
                <div>
                  <Label>University Name</Label>
                  <Input
                    value={formData.university_name || ""}
                    onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
                    placeholder="e.g., Oxford, Cambridge, Imperial"
                  />
                </div>
              )}

              <div>
                <Label>File Upload</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileUpload(file)
                      }
                    }}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {formData.file_name && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <File size={16} />
                      <span>{formData.file_name}</span>
                      {formData.file_size != null && (
                        <span className="text-slate-400">
                          ({formatFileSize(formData.file_size)})
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {uploading && <p className="text-xs text-slate-500 mt-1">Uploading...</p>}
              </div>

              <div>
                <Label>External URL (for videos, links, etc.)</Label>
                <Input
                  type="url"
                  value={formData.external_url || ""}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>Visible To Courses</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medicine"
                      checked={formData.visible_to_medicine}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, visible_to_medicine: checked === true })
                      }
                    />
                    <Label htmlFor="medicine" className="font-normal cursor-pointer">
                      Medicine
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dentistry"
                      checked={formData.visible_to_dentistry}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, visible_to_dentistry: checked === true })
                      }
                    />
                    <Label htmlFor="dentistry" className="font-normal cursor-pointer">
                      Dentistry
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="veterinary"
                      checked={formData.visible_to_veterinary}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, visible_to_veterinary: checked === true })
                      }
                    />
                    <Label htmlFor="veterinary" className="font-normal cursor-pointer">
                      Veterinary Medicine
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    placeholder="Add tag and press Enter"
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90">
                {editingResource ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white border-slate-200 rounded-none">
        <CardHeader>
          <CardTitle className="text-base font-light">All Resources ({resources.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{resource.resource_type.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {resource.visible_to_medicine && (
                        <Badge variant="secondary" className="text-xs">Med</Badge>
                      )}
                      {resource.visible_to_dentistry && (
                        <Badge variant="secondary" className="text-xs">Dent</Badge>
                      )}
                      {resource.visible_to_veterinary && (
                        <Badge variant="secondary" className="text-xs">Vet</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {resource.file_url ? (
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <File size={14} />
                        {resource.file_name || "File"}
                      </div>
                    ) : resource.external_url ? (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <ExternalLink size={14} />
                        Link
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={resource.is_active ? "default" : "secondary"}>
                      {resource.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(resource)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(resource.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {resources.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p className="font-light">No resources yet. Create your first resource above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

