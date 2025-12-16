"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MatteInput } from "@/components/ui/matte-input"
import { MatteTextarea } from "@/components/ui/matte-textarea"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react"
import type { TargetCourse } from "@/lib/supabase/types"

export interface GCSEGrade {
  subject: string
  grade: string
}

export interface ALevelGrade {
  subject: string
  grade: string
}

export interface OnboardingData {
  // Step 1: Personal Details
  full_name: string
  date_of_birth: string
  home_address: string
  contact_number: string
  country: string
  fee_status: "home" | "international" | "unsure"
  entry_year: number
  parent_name: string
  parent_phone: string
  parent_email: string
  parent2_name: string
  parent2_phone: string
  parent2_email: string

  // Step 2: Academic Baseline
  school_name: string
  gcse_grades: GCSEGrade[]
  a_level_grades: ALevelGrade[]

  // Step 3: Course Selection
  target_course: TargetCourse | null
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => Promise<void>
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: "",
    date_of_birth: "",
    home_address: "",
    contact_number: "",
    country: "",
    fee_status: "unsure",
    entry_year: new Date().getFullYear() + 1,
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    parent2_name: "",
    parent2_phone: "",
    parent2_email: "",
    school_name: "",
    gcse_grades: [
      { subject: "English Language", grade: "" },
      { subject: "English Literature", grade: "" },
      { subject: "Maths", grade: "" },
    ],
    a_level_grades: [
      { subject: "", grade: "" },
      { subject: "", grade: "" },
      { subject: "", grade: "" },
    ],
    target_course: null,
  })

  const fieldNameMap: Record<string, string> = {
    full_name: "Full Name",
    date_of_birth: "Date of Birth",
    home_address: "Home Address",
    contact_number: "Contact Number",
    country: "Country of Residence",
    fee_status: "Fee Status",
    entry_year: "Entry Year",
    parent_name: "Parent/Guardian 1 Name",
    parent_phone: "Parent/Guardian 1 Phone",
    parent_email: "Parent/Guardian 1 Email",
    school_name: "School/Institution Name",
    gcse_grades: "GCSE Grades",
    a_level_grades: "A Level (or equivalent) Grades",
    target_course: "Target Course",
  }

  const isFieldMissing = (field: keyof OnboardingData): boolean => {
    if (!showValidationErrors) return false
    const fieldName = fieldNameMap[field]
    return fieldName ? validationErrors.includes(fieldName) : false
  }

  const updateField = (field: keyof OnboardingData, value: string | TargetCourse | number | "home" | "international" | "unsure" | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation errors for this field when user starts typing
    if (showValidationErrors && validationErrors.length > 0) {
      const fieldName = fieldNameMap[field]
      if (fieldName && validationErrors.includes(fieldName)) {
        setValidationErrors(validationErrors.filter(e => e !== fieldName))
        if (validationErrors.length === 1) {
          setShowValidationErrors(false)
        }
      }
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const getMissingFields = (step: number): string[] => {
    const missing: string[] = []
    switch (step) {
      case 1:
        if (!formData.full_name) missing.push("Full Name")
        if (!formData.date_of_birth) missing.push("Date of Birth")
        if (!formData.home_address) missing.push("Home Address")
        if (!formData.contact_number) missing.push("Contact Number")
        if (!formData.country) missing.push("Country of Residence")
        if (!formData.fee_status) missing.push("Fee Status")
        if (!formData.entry_year) missing.push("Entry Year")
        if (!formData.parent_name) missing.push("Parent/Guardian 1 Name")
        if (!formData.parent_phone) missing.push("Parent/Guardian 1 Phone")
        if (!formData.parent_email) missing.push("Parent/Guardian 1 Email")
        break
      case 2:
        if (!formData.school_name) missing.push("School/Institution Name")
        if (!formData.gcse_grades || formData.gcse_grades.length === 0 || formData.gcse_grades.some(g => !g.subject || !g.grade)) {
          missing.push("GCSE Grades")
        }
        if (!formData.a_level_grades || formData.a_level_grades.length === 0 || formData.a_level_grades.some(g => !g.subject || !g.grade)) {
          missing.push("A Level (or equivalent) Grades")
        }
        break
      case 3:
        if (!formData.target_course) missing.push("Target Course")
        break
    }
    return missing
  }

  const validateStep = (step: number): boolean => {
    const missing = getMissingFields(step)
    if (missing.length > 0) {
      setValidationErrors(missing)
      setShowValidationErrors(true)
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // Hide error after 5 seconds
      setTimeout(() => setShowValidationErrors(false), 5000)
      return false
    }
    setValidationErrors([])
    setShowValidationErrors(false)
    return true
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    try {
      await onComplete(formData)
    } catch (error) {
      console.error("Error completing onboarding:", error)
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: "Personal Details", description: "Your information and parent/guardian contacts" },
    { number: 2, title: "Academic Profile", description: "School, qualifications, and predictions" },
    { number: 3, title: "Course Selection", description: "Your target medical course" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Onboarding Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif text-slate-900 mb-2 font-light">Onboarding</h1>
          <p className="text-sm text-slate-600 font-light">Complete your profile to get started</p>
        </div>
        
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 border-2 flex items-center justify-center text-sm font-light transition-all ${
                      currentStep >= step.number
                        ? "border-[#D4AF37] bg-[#D4AF37] text-slate-950"
                        : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 size={20} className="text-slate-950" strokeWidth={2} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-3 text-center max-w-[120px]">
                    <p
                      className={`text-xs font-light uppercase tracking-widest ${
                        currentStep >= step.number ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-light hidden md:block">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 mt-[-24px] ${
                      currentStep > step.number ? "bg-[#D4AF37]" : "bg-slate-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white border border-slate-200 p-10 min-h-[600px]">
          {/* Validation Error Message */}
          {showValidationErrors && validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900 mb-2">
                Please complete the following required fields:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {validationErrors.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-serif text-slate-900 mb-2 font-light">Personal Details</h2>
                  <p className="text-sm text-slate-600 font-light">
                    Please provide your personal information and parent/guardian contact details
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="full_name" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                        Full Name *
                      </Label>
                      <MatteInput
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => updateField("full_name", e.target.value)}
                        className={`text-sm w-full ${isFieldMissing("full_name") ? 'border-red-300 focus:border-red-500' : ''}`}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="date_of_birth" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                        Date of Birth *
                      </Label>
                      <MatteInput
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => updateField("date_of_birth", e.target.value)}
                        className={`text-sm w-full ${isFieldMissing("date_of_birth") ? 'border-red-300 focus:border-red-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact_number" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                      Contact Number *
                    </Label>
                    <div className={isFieldMissing("contact_number") ? 'border-b border-red-300 pb-2' : ''}>
                      <PhoneInput
                        id="contact_number"
                        value={formData.contact_number}
                        onChange={(val) => updateField("contact_number", val)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="home_address" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                      Home Address *
                    </Label>
                    <MatteTextarea
                      id="home_address"
                      value={formData.home_address}
                      onChange={(e) => updateField("home_address", e.target.value)}
                      rows={3}
                      className={`text-sm w-full ${isFieldMissing("home_address") ? 'border-red-300 focus:border-red-500' : ''}`}
                      placeholder="24 Kensington Gardens, London, W8 4RT"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="country" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                        Country of Residence *
                      </Label>
                      <MatteInput
                        id="country"
                        value={formData.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        className={`text-sm w-full ${isFieldMissing("country") ? 'border-red-300 focus:border-red-500' : ''}`}
                        placeholder="United Kingdom"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="fee_status" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                        Fee Status *
                      </Label>
                      <Select
                        value={formData.fee_status}
                        onValueChange={(value) => updateField("fee_status", value as "home" | "international" | "unsure")}
                      >
                        <SelectTrigger className={`w-full border-0 border-b rounded-none px-0 py-2 focus:ring-0 bg-transparent font-light text-slate-900 h-auto text-sm data-[placeholder]:text-slate-400 ${isFieldMissing("fee_status") ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-[#D4AF37]'}`}>
                          <SelectValue placeholder="Select fee status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 rounded-none">
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="international">International</SelectItem>
                          <SelectItem value="unsure">Unsure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="entry_year" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                        Entry Year *
                      </Label>
                      <MatteInput
                        id="entry_year"
                        type="number"
                        value={formData.entry_year}
                        onChange={(e) => updateField("entry_year", parseInt(e.target.value) || new Date().getFullYear() + 1)}
                        className={`text-sm w-full ${isFieldMissing("entry_year") ? 'border-red-300 focus:border-red-500' : ''}`}
                        min={new Date().getFullYear()}
                        max={new Date().getFullYear() + 5}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-serif text-slate-900 mb-6 font-light">Parent/Guardian 1</h3>

                    <div className="space-y-5">
                      <div>
                        <Label htmlFor="parent_name" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Name *
                        </Label>
                        <MatteInput
                          id="parent_name"
                          value={formData.parent_name}
                          onChange={(e) => updateField("parent_name", e.target.value)}
                          className={`text-sm w-full ${isFieldMissing("parent_name") ? 'border-red-300 focus:border-red-500' : ''}`}
                          placeholder="Enter parent/guardian name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="parent_phone" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Phone *
                        </Label>
                        <div className={isFieldMissing("parent_phone") ? 'border-b border-red-300 pb-2' : ''}>
                          <PhoneInput
                            id="parent_phone"
                            value={formData.parent_phone}
                            onChange={(val) => updateField("parent_phone", val)}
                            className="w-full"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="parent_email" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Email *
                        </Label>
                        <MatteInput
                          id="parent_email"
                          type="email"
                          value={formData.parent_email}
                          onChange={(e) => updateField("parent_email", e.target.value)}
                          className={`text-sm w-full ${isFieldMissing("parent_email") ? 'border-red-300 focus:border-red-500' : ''}`}
                          placeholder="parent@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-serif text-slate-900 mb-6 font-light">Parent/Guardian 2 (Optional)</h3>

                    <div className="space-y-5">
                      <div>
                        <Label htmlFor="parent2_name" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Name
                        </Label>
                        <MatteInput
                          id="parent2_name"
                          value={formData.parent2_name}
                          onChange={(e) => updateField("parent2_name", e.target.value)}
                          className="text-sm w-full"
                          placeholder="Enter parent/guardian name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="parent2_phone" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Phone
                        </Label>
                        <PhoneInput
                          id="parent2_phone"
                          value={formData.parent2_phone}
                          onChange={(val) => updateField("parent2_phone", val)}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label htmlFor="parent2_email" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Email
                        </Label>
                        <MatteInput
                          id="parent2_email"
                          type="email"
                          value={formData.parent2_email}
                          onChange={(e) => updateField("parent2_email", e.target.value)}
                          className="text-sm w-full"
                          placeholder="parent2@example.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Academic Baseline */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-serif text-slate-900 mb-2 font-light">Academic Profile</h2>
                  <p className="text-sm text-slate-600 font-light">Provide your academic qualifications and predictions</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="school_name" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                      School/Institution Name *
                    </Label>
                    <MatteInput
                      id="school_name"
                      value={formData.school_name}
                      onChange={(e) => updateField("school_name", e.target.value)}
                      className={`text-sm w-full ${isFieldMissing("school_name") ? 'border-red-300 focus:border-red-500' : ''}`}
                      placeholder="Westminster Academy"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                      GCSE Grades *
                    </Label>
                    <div className="space-y-3">
                      {/* Column Headers */}
                      <div className="grid grid-cols-[1fr_120px_40px] gap-3 pb-2 border-b border-slate-200">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-light">Subject</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-light">Grade</p>
                        <div></div>
                      </div>
                      
                      {formData.gcse_grades.map((gcse, index) => (
                        <div key={index} className="grid grid-cols-[1fr_120px_40px] gap-3 items-center">
                          <div>
                            <MatteInput
                              value={gcse.subject}
                              onChange={(e) => {
                                const updated = [...formData.gcse_grades]
                                updated[index] = { ...updated[index], subject: e.target.value }
                                setFormData({ ...formData, gcse_grades: updated })
                                if (showValidationErrors && validationErrors.includes("GCSE Grades")) {
                                  const allFilled = updated.every(g => g.subject && g.grade)
                                  if (allFilled) {
                                    setValidationErrors(validationErrors.filter(e => e !== "GCSE Grades"))
                                  }
                                }
                              }}
                              className={`text-sm w-full ${isFieldMissing("gcse_grades") && (!gcse.subject || !gcse.grade) ? 'border-red-300 focus:border-red-500' : ''} ${index < 3 ? 'bg-slate-50' : ''}`}
                              placeholder="Subject"
                              disabled={index < 3} // Disable editing subject names for the 3 default subjects
                            />
                          </div>
                          <div>
                            <MatteInput
                              value={gcse.grade}
                              onChange={(e) => {
                                const updated = [...formData.gcse_grades]
                                updated[index] = { ...updated[index], grade: e.target.value }
                                setFormData({ ...formData, gcse_grades: updated })
                                if (showValidationErrors && validationErrors.includes("GCSE Grades")) {
                                  const allFilled = updated.every(g => g.subject && g.grade)
                                  if (allFilled) {
                                    setValidationErrors(validationErrors.filter(e => e !== "GCSE Grades"))
                                  }
                                }
                              }}
                              className={`text-sm w-full ${isFieldMissing("gcse_grades") && (!gcse.subject || !gcse.grade) ? 'border-red-300 focus:border-red-500' : ''}`}
                              placeholder="Grade"
                            />
                          </div>
                          <div className="flex justify-center">
                            {index >= 3 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = formData.gcse_grades.filter((_, i) => i !== index)
                                  setFormData({ ...formData, gcse_grades: updated })
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0"
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            gcse_grades: [...formData.gcse_grades, { subject: "", grade: "" }]
                          })
                        }}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-none text-xs font-light mt-2"
                      >
                        <Plus size={14} className="mr-1" />
                        Add Subject
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                      A Level (or equivalent) Grades *
                    </Label>
                    <div className="space-y-3">
                      {/* Column Headers */}
                      <div className="grid grid-cols-[1fr_120px_40px] gap-3 pb-2 border-b border-slate-200">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-light">Subject</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-light">Grade</p>
                        <div></div>
                      </div>
                      
                      {formData.a_level_grades.map((alevel, index) => (
                        <div key={index} className="grid grid-cols-[1fr_120px_40px] gap-3 items-center">
                          <div>
                            <MatteInput
                              value={alevel.subject}
                              onChange={(e) => {
                                const updated = [...formData.a_level_grades]
                                updated[index] = { ...updated[index], subject: e.target.value }
                                setFormData({ ...formData, a_level_grades: updated })
                                if (showValidationErrors && validationErrors.includes("A Level (or equivalent) Grades")) {
                                  const allFilled = updated.every(g => g.subject && g.grade)
                                  if (allFilled) {
                                    setValidationErrors(validationErrors.filter(e => e !== "A Level (or equivalent) Grades"))
                                  }
                                }
                              }}
                              className={`text-sm w-full ${isFieldMissing("a_level_grades") && (!alevel.subject || !alevel.grade) ? 'border-red-300 focus:border-red-500' : ''}`}
                              placeholder="Subject"
                            />
                          </div>
                          <div>
                            <MatteInput
                              value={alevel.grade}
                              onChange={(e) => {
                                const updated = [...formData.a_level_grades]
                                updated[index] = { ...updated[index], grade: e.target.value }
                                setFormData({ ...formData, a_level_grades: updated })
                                if (showValidationErrors && validationErrors.includes("A Level (or equivalent) Grades")) {
                                  const allFilled = updated.every(g => g.subject && g.grade)
                                  if (allFilled) {
                                    setValidationErrors(validationErrors.filter(e => e !== "A Level (or equivalent) Grades"))
                                  }
                                }
                              }}
                              className={`text-sm w-full ${isFieldMissing("a_level_grades") && (!alevel.subject || !alevel.grade) ? 'border-red-300 focus:border-red-500' : ''}`}
                              placeholder="Grade"
                            />
                          </div>
                          <div className="flex justify-center">
                            {formData.a_level_grades.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = formData.a_level_grades.filter((_, i) => i !== index)
                                  setFormData({ ...formData, a_level_grades: updated })
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0"
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            a_level_grades: [...formData.a_level_grades, { subject: "", grade: "" }]
                          })
                        }}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-none text-xs font-light mt-2"
                      >
                        <Plus size={14} className="mr-1" />
                        Add Subject
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Course Selection */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-serif text-slate-900 mb-2 font-light">Course Selection</h2>
                  <p className="text-sm text-slate-600 font-light">
                    Select your target course. This will customize your dashboard experience.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="target_course" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-4 block">
                      Target Course *
                    </Label>
                    <Select
                      value={formData.target_course || ""}
                      onValueChange={(value) => updateField("target_course", value as TargetCourse)}
                    >
                      <SelectTrigger className={`border-0 border-b rounded-none px-0 py-3 focus:ring-0 bg-transparent font-light text-slate-900 h-auto ${isFieldMissing("target_course") ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-[#D4AF37]'}`}>
                        <SelectValue placeholder="Select your target course" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 rounded-none">
                        <SelectItem value="medicine">Medicine</SelectItem>
                        <SelectItem value="dentistry">Dentistry</SelectItem>
                        <SelectItem value="veterinary">Veterinary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-8 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg uppercase tracking-widest font-light disabled:opacity-30 disabled:cursor-not-allowed px-6"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => {
                  if (!validateStep(currentStep)) {
                    // Validation error already shown by validateStep
                    return
                  }
                  handleNext()
                }}
                className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg uppercase tracking-widest font-light disabled:opacity-50 disabled:cursor-not-allowed px-8"
              >
                Next Step
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  if (!validateStep(3)) {
                    // Validation error already shown by validateStep
                    return
                  }
                  handleSubmit()
                }}
                disabled={isSubmitting}
                className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg uppercase tracking-widest font-light disabled:opacity-50 disabled:cursor-not-allowed px-8"
              >
                {isSubmitting ? "Saving..." : "Complete Registration"}
                <CheckCircle2 size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
