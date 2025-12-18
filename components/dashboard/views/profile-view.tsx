"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { MatteInput } from "@/components/ui/matte-input"
import { MatteTextarea } from "@/components/ui/matte-textarea"
import { User, GraduationCap, Shield, Edit2, Save, X, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { getCurrentUser, updateUser } from "@/lib/supabase/queries"
import type { User as UserType } from "@/lib/supabase/types"
import { DocumentUpload } from "@/components/portal/document-upload"
import { DocumentList } from "@/components/portal/document-list"

interface ProfileViewProps {
  viewMode: "student" | "parent" | "mentor"
  userData?: UserType | null
}

export function ProfileView({ viewMode, userData }: ProfileViewProps) {
  const [user, setUser] = useState<UserType | null>(userData || null)
  const [isLoading, setIsLoading] = useState(!userData)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    email: "",
    home_address: "",
    contact_number: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    parent2_name: "",
    parent2_phone: "",
    parent2_email: "",
    school_name: "",
    gcse_summary: "",
    a_level_predictions: "",
  })

  useEffect(() => {
    if (userData) {
      setUser(userData)
      setIsLoading(false)
      setFormData({
        full_name: userData.full_name || "",
        date_of_birth: userData.date_of_birth || "",
        email: userData.email || "",
        home_address: userData.home_address || "",
        contact_number: userData.contact_number || "",
        parent_name: userData.parent_name || "",
        parent_phone: userData.parent_phone || "",
        parent_email: userData.parent_email || "",
        parent2_name: userData.parent2_name || "",
        parent2_phone: userData.parent2_phone || "",
        parent2_email: userData.parent2_email || "",
        school_name: userData.school_name || "",
        gcse_summary: userData.gcse_summary || "",
        a_level_predictions: userData.a_level_predictions || "",
      })
    } else {
      loadUserData()
    }
  }, [userData])

  const loadUserData = async () => {
    setIsLoading(true)
    try {
      // Force refresh to get latest data after updates
      const currentUser = await getCurrentUser(true)
      if (currentUser) {
        setUser(currentUser)
        setFormData({
          full_name: currentUser.full_name || "",
          date_of_birth: currentUser.date_of_birth || "",
          email: currentUser.email || "",
          home_address: currentUser.home_address || "",
          contact_number: currentUser.contact_number || "",
          parent_name: currentUser.parent_name || "",
          parent_phone: currentUser.parent_phone || "",
          parent_email: currentUser.parent_email || "",
          parent2_name: currentUser.parent2_name || "",
          parent2_phone: currentUser.parent2_phone || "",
          parent2_email: currentUser.parent2_email || "",
          school_name: currentUser.school_name || "",
          gcse_summary: currentUser.gcse_summary || "",
          a_level_predictions: currentUser.a_level_predictions || "",
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const updated = await updateUser(user.id, {
        full_name: formData.full_name || null,
        date_of_birth: formData.date_of_birth || null,
        home_address: formData.home_address || null,
        contact_number: formData.contact_number || null,
        parent_name: formData.parent_name || null,
        parent_phone: formData.parent_phone || null,
        parent_email: formData.parent_email || null,
        parent2_name: formData.parent2_name || null,
        parent2_phone: formData.parent2_phone || null,
        parent2_email: formData.parent2_email || null,
        school_name: formData.school_name || null,
        gcse_summary: formData.gcse_summary || null,
        a_level_predictions: formData.a_level_predictions || null,
      })

      if (updated) {
        setUser(updated)
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        date_of_birth: user.date_of_birth || "",
        email: user.email || "",
        home_address: user.home_address || "",
        contact_number: (user as any).contact_number || "",
        parent_name: user.parent_name || "",
        parent_phone: user.parent_phone || "",
        parent_email: user.parent_email || "",
        parent2_name: (user as any).parent2_name || "",
        parent2_phone: (user as any).parent2_phone || "",
        parent2_email: (user as any).parent2_email || "",
        school_name: user.school_name || "",
        gcse_summary: user.gcse_summary || "",
        a_level_predictions: user.a_level_predictions || "",
      })
    }
    setIsEditing(false)
  }

  const canEdit = viewMode === "student" || viewMode === "parent" || viewMode === "mentor"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-500 font-light">Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-slate-900 font-light mb-2">No profile data available</p>
          <p className="text-sm text-slate-600 font-light">Please complete your onboarding to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Badge - Top of Page */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-none">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-light">
              Active Candidacy
            </span>
          </div>
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-none">
            <span className="text-xs uppercase tracking-widest text-blue-700 font-light">
              Consultant Review
            </span>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-none uppercase tracking-widest text-xs font-light px-4 py-2"
              >
                <Edit2 size={14} className="mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-none uppercase tracking-widest text-xs font-light px-4 py-2"
                >
                  <X size={14} className="mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-none uppercase tracking-widest text-xs font-light px-4 py-2"
                >
                  <Save size={14} className="mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Personal Details Card */}
      <Card className="bg-white border-slate-200 rounded-none">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-base font-light text-slate-900 flex items-center gap-2">
            <User size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
            <span className="uppercase tracking-wider text-sm">Personal Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                Full Name
              </Label>
              {isEditing ? (
                <MatteInput
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-slate-900 font-medium">{user.full_name || "—"}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                Date of Birth
              </Label>
              {isEditing ? (
                <MatteInput
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-slate-900 font-medium">
                  {user.date_of_birth
                    ? new Date(user.date_of_birth).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                Email Address
              </Label>
              <p className="text-sm text-slate-900 font-medium">{user.email}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                Home Address
              </Label>
              {isEditing ? (
                <MatteTextarea
                  value={formData.home_address}
                  onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
                  rows={2}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-slate-900 font-medium">{user.home_address || "—"}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                Contact Number
              </Label>
              {isEditing ? (
                <PhoneInput
                  value={formData.contact_number}
                  onChange={(val) => setFormData({ ...formData, contact_number: val })}
                />
              ) : (
                <p className="text-sm text-slate-900 font-medium">
                    {user.contact_number || "—"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent/Guardian Information - 2 Parents */}
      <Card className="bg-white border-slate-200 rounded-none">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-base font-light text-slate-900 flex items-center gap-2">
            <Shield size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
            <span className="uppercase tracking-wider text-sm">Parent/Guardian Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          {/* Parent 1 */}
          <div>
            <h4 className="text-xs text-slate-400 uppercase tracking-widest font-light mb-4">
              Parent 1
            </h4>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                  Parent Name
                </Label>
                {isEditing ? (
                  <MatteInput
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm text-slate-900 font-medium">{user.parent_name || "—"}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                  Parent Phone
                </Label>
                {isEditing ? (
                  <PhoneInput
                    value={formData.parent_phone}
                    onChange={(val) => setFormData({ ...formData, parent_phone: val })}
                  />
                ) : (
                  <p className="text-sm text-slate-900 font-medium">{user.parent_phone || "—"}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                  Parent Email
                </Label>
                {isEditing ? (
                  <MatteInput
                    type="email"
                    value={formData.parent_email}
                    onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                    className="text-sm"
                    placeholder="parent@example.com"
                  />
                ) : (
                  <p className="text-sm text-slate-900 font-medium">{user.parent_email || "—"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Parent 2 */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs text-slate-400 uppercase tracking-widest font-light mb-4">
              Parent 2
            </h4>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                  Parent Name
                </Label>
                {isEditing ? (
                  <MatteInput
                    value={formData.parent2_name}
                    onChange={(e) => setFormData({ ...formData, parent2_name: e.target.value })}
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm text-slate-900 font-medium">
                    {user.parent2_name || "—"}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                  Parent Phone
                </Label>
                {isEditing ? (
                  <PhoneInput
                    value={formData.parent2_phone}
                    onChange={(val) => setFormData({ ...formData, parent2_phone: val })}
                  />
                ) : (
                  <p className="text-sm text-slate-900 font-medium">
                    {user.parent2_phone || "—"}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                  Parent Email
                </Label>
                {isEditing ? (
                  <MatteInput
                    type="email"
                    value={formData.parent2_email}
                    onChange={(e) => setFormData({ ...formData, parent2_email: e.target.value })}
                    className="text-sm"
                    placeholder="parent2@example.com"
                  />
                ) : (
                  <p className="text-sm text-slate-900 font-medium">
                    {user.parent2_email || "—"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Profile Card */}
      <Card className="bg-white border-slate-200 rounded-none">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-base font-light text-slate-900 flex items-center gap-2">
            <GraduationCap size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
            <span className="uppercase tracking-wider text-sm">Academic Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                Institution
              </Label>
              {isEditing ? (
                <MatteInput
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-slate-900 font-medium">{user.school_name || "—"}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                Curriculum Type
              </Label>
              <p className="text-sm text-slate-900 font-medium">A-Level</p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                Current Year
              </Label>
              <p className="text-sm text-slate-900 font-medium">Year 12</p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                GCSE Summary
              </Label>
              {isEditing ? (
                <MatteTextarea
                  value={formData.gcse_summary}
                  onChange={(e) => setFormData({ ...formData, gcse_summary: e.target.value })}
                  rows={2}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-slate-900 font-medium">{user.gcse_summary || "—"}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                GCSE Count
              </Label>
              <p className="text-sm text-slate-900 font-medium">9 Subjects</p>
            </div>
            <div className="col-span-3">
              <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1 block">
                A-Level Predictions
              </Label>
              {isEditing ? (
                <MatteInput
                  value={formData.a_level_predictions}
                  onChange={(e) => setFormData({ ...formData, a_level_predictions: e.target.value })}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-slate-900 font-medium">
                  {user.a_level_predictions || "—"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Status Card - Read Only */}
      <Card className="bg-white border-slate-200 rounded-none">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-base font-light text-slate-900 flex items-center gap-2">
            <Shield size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
            <span className="uppercase tracking-wider text-sm">Administrative Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1">
                Consultant Assigned
              </p>
              <p className="text-sm text-slate-900 font-medium">
                {user.consultant_assigned || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1">
                Contract Status
              </p>
              <span className="inline-flex items-center px-2 py-1 bg-green-50 border border-green-200 rounded-none">
                <span className="text-xs uppercase tracking-wider text-green-700 font-light">
                  {user.contract_status || "Active"}
                </span>
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-light mb-1">
                Client ID
              </p>
              <p className="text-sm text-slate-900 font-medium">{user.client_id || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card className="bg-white border-slate-200 rounded-none">
        <CardHeader className="border-b border-slate-200 pb-3">
          <CardTitle className="text-base font-light text-slate-900 flex items-center gap-2">
            <FileText size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
            <span className="uppercase tracking-wider text-sm">Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          {/* Personal Statement */}
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">Personal Statement</h3>
            {canEdit && <DocumentUpload userId={user.id} category="personal_statement" onUploadComplete={loadUserData} />}
            <div className="mt-3">
              <DocumentList 
                userId={user.id} 
                category="personal_statement" 
                viewMode={viewMode}
                canEdit={canEdit}
                onDocumentDeleted={loadUserData}
              />
            </div>
          </div>

          {/* CV */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-medium text-slate-900 mb-3">CV</h3>
            {canEdit && <DocumentUpload userId={user.id} category="cv" onUploadComplete={loadUserData} />}
            <div className="mt-3">
              <DocumentList 
                userId={user.id} 
                category="cv" 
                viewMode={viewMode}
                canEdit={canEdit}
                onDocumentDeleted={loadUserData}
              />
            </div>
          </div>

          {/* Grades */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-medium text-slate-900 mb-3">Grades</h3>
            {canEdit && <DocumentUpload userId={user.id} category="grades" onUploadComplete={loadUserData} />}
            <div className="mt-3">
              <DocumentList 
                userId={user.id} 
                category="grades" 
                viewMode={viewMode}
                canEdit={canEdit}
                onDocumentDeleted={loadUserData}
              />
            </div>
          </div>

          {/* Other Documents */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-medium text-slate-900 mb-3">Other Documents</h3>
            {canEdit && <DocumentUpload userId={user.id} category="other" onUploadComplete={loadUserData} />}
            <div className="mt-3">
              <DocumentList 
                userId={user.id} 
                category="other" 
                viewMode={viewMode}
                canEdit={canEdit}
                onDocumentDeleted={loadUserData}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
