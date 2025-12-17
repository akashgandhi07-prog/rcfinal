"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface SuitabilityAssessmentFormProps {
  trigger: React.ReactNode
}

export function SuitabilityAssessmentForm({ trigger }: SuitabilityAssessmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [stepError, setStepError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    isStudent: "",
    country: "",
    schoolName: "",
    universityEntryYear: "",
    subject: "",
    studentDOB: "",
    yearOfStudy: "",
    notes: "",
  })

  const validateStep = (targetStep: 1 | 2 | 3): boolean => {
    // Minimal client-side validation so users can't skip required fields
    if (targetStep === 1) {
      const { firstName, lastName, email, phoneNumber, isStudent, country } = formData
      if (!firstName || !lastName || !email || !phoneNumber || !isStudent || !country) {
        setStepError("Please complete all required personal details before continuing.")
        return false
      }
    }

    if (targetStep === 2) {
      const { schoolName, universityEntryYear, yearOfStudy, subject, studentDOB } = formData
      if (!schoolName || !universityEntryYear || !yearOfStudy || !subject || !studentDOB) {
        setStepError("Please complete all required academic details before continuing.")
        return false
      }
    }

    setStepError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Ensure all steps are valid before attempting to submit
    if (!validateStep(1)) {
      setStep(1)
      return
    }
    if (!validateStep(2)) {
      setStep(2)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/send-assessment-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      setSubmitStatus("success")
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        isStudent: "",
        country: "",
        schoolName: "",
        universityEntryYear: "",
        subject: "",
        studentDOB: "",
        yearOfStudy: "",
        notes: "",
      })
      setStep(1)
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsOpen(false)
        setSubmitStatus("idle")
        setStep(1)
      }, 2000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white border-slate-200 max-w-4xl w-[96vw] md:w-full max-h-[90vh] overflow-y-auto rounded-2xl px-3 py-5 md:px-10 md:py-8">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-serif text-slate-900 font-light">
            Apply for Suitability Assessment
          </DialogTitle>
          <div className="mt-3 flex items-center justify-between text-xs md:text-sm text-slate-700">
            <span className="font-light">
              Step {step} of 3
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    s <= step ? "bg-slate-900" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {/* Step 1: Personal Information */}
          {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-sm font-light text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm text-slate-700 font-light">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className="border-slate-300 text-slate-900 rounded-lg h-12 text-base px-4 w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm text-slate-700 font-light">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className="border-slate-300 text-slate-900 rounded-lg h-12 text-base px-4 w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-slate-700 font-light">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="border-slate-300 text-slate-900 rounded-lg h-12 text-base px-4 w-full"
                  required
                />
              </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="phoneNumber" className="text-sm text-slate-700 font-light">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <PhoneInput
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(val) => updateField("phoneNumber", val)}
                className="w-full max-w-full"
                required
              />
            </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isStudent" className="text-sm text-slate-700 font-light">
                Are You A Student Or Guardian? <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.isStudent} onValueChange={(value) => updateField("isStudent", value)} required>
              <SelectTrigger className="border-slate-300 text-slate-900 rounded-lg h-12 text-base px-4 w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-lg">
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm text-slate-700 font-light">
                Country Of Residence <span className="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => updateField("country", e.target.value)}
                className="border-slate-300 text-slate-900 rounded-lg h-12 text-base px-4 w-full"
                required
              />
            </div>
          </div>
          )}

          {/* Step 2: Academic Information */}
          {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-light text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
              Academic Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="schoolName" className="text-sm text-slate-700 font-light">
                Current School / College Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => updateField("schoolName", e.target.value)}
                className="border-slate-300 text-slate-900 rounded-lg h-12 text-base px-4 w-full"
                placeholder="If graduated - please state both sixth form & university attended and course studied"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="universityEntryYear" className="text-sm text-slate-700 font-light">
                  University Entry Year <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.universityEntryYear}
                  onValueChange={(value) => updateField("universityEntryYear", value)}
                  required
                >
                <SelectTrigger className="border-slate-300 text-slate-900 rounded-lg h-12 text-base px-4 w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-lg">
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                    <SelectItem value="2029">2029</SelectItem>
                    <SelectItem value="2030">2030</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearOfStudy" className="text-sm text-slate-700 font-light">
                  Year of Study <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.yearOfStudy}
                  onValueChange={(value) => updateField("yearOfStudy", value)}
                  required
                >
                <SelectTrigger className="border-slate-300 text-slate-900 rounded-lg h-12 text-base px-4 w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-lg">
                  <SelectItem value="Year 10">Year 10</SelectItem>
                  <SelectItem value="Year 11">Year 11</SelectItem>
                  <SelectItem value="Year 12">Year 12</SelectItem>
                    <SelectItem value="Year 13">Year 13</SelectItem>
                    <SelectItem value="Gap Year">Gap Year</SelectItem>
                    <SelectItem value="University (Year 1)">University (Year 1)</SelectItem>
                    <SelectItem value="University (Year 2+)">University (Year 2+)</SelectItem>
                    <SelectItem value="Graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm text-slate-700 font-light">
                  Subject (that you are applying for) <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.subject} onValueChange={(value) => updateField("subject", value)} required>
                  <SelectTrigger className="border-slate-300 text-slate-900 rounded-lg h-12 text-base px-4 w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 rounded-lg">
                    <SelectItem value="Medicine">Medicine</SelectItem>
                    <SelectItem value="Dentistry">Dentistry</SelectItem>
                    <SelectItem value="Veterinary Medicine">Veterinary Medicine</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentDOB" className="text-sm text-slate-700 font-light">
                  Student Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="studentDOB"
                  type="date"
                  value={formData.studentDOB}
                  onChange={(e) => updateField("studentDOB", e.target.value)}
                  className="border-slate-300 text-slate-900 rounded-lg h-12 text-base px-4 w-full"
                  required
                />
              </div>
            </div>
          </div>
          )}

          {/* Step 3: Additional Information */}
          {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-light text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
              Additional Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm text-slate-700 font-light">
                Notes / Additional Information
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="border-slate-300 text-slate-900 rounded-lg min-h-32 text-base px-4 py-3 w-full"
                placeholder="Please provide any additional information that would be helpful..."
              />
            </div>
          </div>
          )}

          {/* Step-level validation message */}
          {stepError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-light">{stepError}</p>
            </div>
          )}

          {/* Submit Status */}
          {submitStatus === "success" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-light">
                Thank you! Your suitability assessment request has been submitted successfully.
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-light">
                There was an error submitting your request. Please try again or contact us directly.
              </p>
            </div>
          )}

          {/* Navigation / Submit Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-200 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-slate-700 font-light">
              You can review and edit your answers before submitting.
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (step > 1) {
                    setStep((prev) => (prev - 1) as 1 | 2 | 3)
                  } else {
                    setIsOpen(false)
                    setStep(1)
                    setSubmitStatus("idle")
                  }
                }}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-light shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0"
                disabled={isSubmitting}
              >
                {step === 1 ? "Cancel" : "Back"}
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-light shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0"
                  onClick={() => {
                    const nextStep = (step + 1) as 1 | 2 | 3
                    if (!validateStep(step)) return
                    setStep(nextStep)
                  }}
                  disabled={isSubmitting}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-lg font-light shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Assessment Request"
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

