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
import { validateEmail } from "@/lib/utils/validation"

// Countries list with flags (same as phone-input)
const COUNTRIES = [
  { label: "Afghanistan", flag: "🇦🇫" },
  { label: "Albania", flag: "🇦🇱" },
  { label: "Algeria", flag: "🇩🇿" },
  { label: "Andorra", flag: "🇦🇩" },
  { label: "Angola", flag: "🇦🇴" },
  { label: "Argentina", flag: "🇦🇷" },
  { label: "Australia", flag: "🇦🇺" },
  { label: "Austria", flag: "🇦🇹" },
  { label: "Bahrain", flag: "🇧🇭" },
  { label: "Bangladesh", flag: "🇧🇩" },
  { label: "Belarus", flag: "🇧🇾" },
  { label: "Belgium", flag: "🇧🇪" },
  { label: "Brazil", flag: "🇧🇷" },
  { label: "Bulgaria", flag: "🇧🇬" },
  { label: "Canada", flag: "🇨🇦" },
  { label: "China", flag: "🇨🇳" },
  { label: "Colombia", flag: "🇨🇴" },
  { label: "Croatia", flag: "🇭🇷" },
  { label: "Cyprus", flag: "🇨🇾" },
  { label: "Czech Republic", flag: "🇨🇿" },
  { label: "Denmark", flag: "🇩🇰" },
  { label: "Egypt", flag: "🇪🇬" },
  { label: "Estonia", flag: "🇪🇪" },
  { label: "Finland", flag: "🇫🇮" },
  { label: "France", flag: "🇫🇷" },
  { label: "Germany", flag: "🇩🇪" },
  { label: "Ghana", flag: "🇬🇭" },
  { label: "Greece", flag: "🇬🇷" },
  { label: "Hong Kong", flag: "🇭🇰" },
  { label: "Hungary", flag: "🇭🇺" },
  { label: "Iceland", flag: "🇮🇸" },
  { label: "India", flag: "🇮🇳" },
  { label: "Indonesia", flag: "🇮🇩" },
  { label: "Iran", flag: "🇮🇷" },
  { label: "Ireland", flag: "🇮🇪" },
  { label: "Israel", flag: "🇮🇱" },
  { label: "Italy", flag: "🇮🇹" },
  { label: "Japan", flag: "🇯🇵" },
  { label: "Kenya", flag: "🇰🇪" },
  { label: "Kuwait", flag: "🇰🇼" },
  { label: "Malaysia", flag: "🇲🇾" },
  { label: "Malta", flag: "🇲🇹" },
  { label: "Mexico", flag: "🇲🇽" },
  { label: "Netherlands", flag: "🇳🇱" },
  { label: "New Zealand", flag: "🇳🇿" },
  { label: "Nigeria", flag: "🇳🇬" },
  { label: "Norway", flag: "🇳🇴" },
  { label: "Pakistan", flag: "🇵🇰" },
  { label: "Philippines", flag: "🇵🇭" },
  { label: "Poland", flag: "🇵🇱" },
  { label: "Portugal", flag: "🇵🇹" },
  { label: "Qatar", flag: "🇶🇦" },
  { label: "Romania", flag: "🇷🇴" },
  { label: "Russia", flag: "🇷🇺" },
  { label: "Saudi Arabia", flag: "🇸🇦" },
  { label: "Singapore", flag: "🇸🇬" },
  { label: "South Africa", flag: "🇿🇦" },
  { label: "South Korea", flag: "🇰🇷" },
  { label: "Spain", flag: "🇪🇸" },
  { label: "Sweden", flag: "🇸🇪" },
  { label: "Switzerland", flag: "🇨🇭" },
  { label: "Thailand", flag: "🇹🇭" },
  { label: "Turkey", flag: "🇹🇷" },
  { label: "Ukraine", flag: "🇺🇦" },
  { label: "United Arab Emirates", flag: "🇦🇪" },
  { label: "United Kingdom", flag: "🇬🇧" },
  { label: "United States", flag: "🇺🇸" },
  { label: "Vietnam", flag: "🇻🇳" },
].sort((a, b) => a.label.localeCompare(b.label))

interface SuitabilityAssessmentFormProps {
  trigger: React.ReactNode
}

export function SuitabilityAssessmentForm({ trigger }: SuitabilityAssessmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [stepError, setStepError] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    isStudent: "",
    country: "",
    feeStatus: "",
    schoolName: "",
    universityEntryYear: "",
    subject: "",
    studentDOB: "",
    yearOfStudy: "",
    howDidYouHearAboutUs: "",
    notes: "",
  })

  const validateStep = (targetStep: 1 | 2 | 3): boolean => {
    if (targetStep === 1) {
      const { firstName, lastName, email, phoneNumber, isStudent, country, feeStatus } = formData
      if (!firstName || !lastName || !email || !phoneNumber || !isStudent || !country || !feeStatus) {
        setStepError("Please complete all required personal details before continuing.")
        return false
      }
      if (!validateEmail(email)) {
        setStepError("Please enter a valid email address.")
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
    if (isSubmitting || hasSubmitted) return
    if (!validateStep(1)) { setStep(1); return }
    if (!validateStep(2)) { setStep(2); return }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setHasSubmitted(true)

    try {
      const response = await fetch("/api/send-assessment-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error("Failed to send email")

      setSubmitStatus("success")
      setFormData({
        firstName: "", lastName: "", email: "", phoneNumber: "", isStudent: "",
        country: "", feeStatus: "", schoolName: "", universityEntryYear: "",
        subject: "", studentDOB: "", yearOfStudy: "", howDidYouHearAboutUs: "", notes: "",
      })
      setStep(1)
      setHasSubmitted(false)
      
      setTimeout(() => {
        setIsOpen(false)
        setSubmitStatus("idle")
        setStep(1)
        setHasSubmitted(false)
      }, 2000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitStatus("error")
      setHasSubmitted(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setStep(1)
    setSubmitStatus("idle")
    setStepError(null)
    setHasSubmitted(false)
    setCountrySearch("")
    setShowCountryDropdown(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm() }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent 
        className="bg-white border-slate-200 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-xl sm:rounded-2xl p-0 mx-4 sm:mx-auto"
        aria-describedby="form-description"
      >
        <div className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 flex-shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-serif text-slate-900 font-light">
              Suitability Assessment Application
            </DialogTitle>
            <p id="form-description" className="sr-only">
              Multi-step form to request a suitability assessment. Complete all required fields in each step.
            </p>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span className="font-medium">Step {step} of 3</span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`h-1.5 w-6 sm:w-8 rounded-full transition-colors ${
                      s <= step ? "bg-slate-900" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </DialogHeader>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
            <form 
              onSubmit={handleSubmit} 
              className="px-6 py-6"
              onKeyDown={(e) => { if (e.key === 'Enter' && step < 3) { e.preventDefault(); e.stopPropagation() }}}
            >
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="isStudent" className="text-sm font-medium text-slate-700">
                        Student or Guardian? <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.isStudent} onValueChange={(value) => updateField("isStudent", value)} required>
                        <SelectTrigger className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 rounded-lg">
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Guardian">Guardian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-slate-700">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <PhoneInput
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(val) => updateField("phoneNumber", val)}
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 relative">
                      <Label htmlFor="country" className="text-sm font-medium text-slate-700">
                        Country of Residence <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="relative">
                          {formData.country && !countrySearch && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              {COUNTRIES.find(c => c.label === formData.country)?.flag}
                            </div>
                          )}
                          <Input
                            id="country"
                            type="text"
                            value={countrySearch || formData.country}
                            onChange={(e) => {
                              const value = e.target.value
                              setCountrySearch(value)
                              setShowCountryDropdown(true)
                              if (!value) {
                                updateField("country", "")
                              }
                            }}
                            onFocus={() => {
                              setShowCountryDropdown(true)
                              if (formData.country) {
                                setCountrySearch("")
                              }
                            }}
                            onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                            className={`h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full ${formData.country && !countrySearch ? 'pl-9' : ''}`}
                            placeholder="Type to search country..."
                            required
                            autoComplete="off"
                          />
                        </div>
                        {showCountryDropdown && (countrySearch || !formData.country) && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                            {COUNTRIES.filter((country) =>
                              !countrySearch || country.label.toLowerCase().includes(countrySearch.toLowerCase())
                            ).slice(0, 15).map((country) => (
                              <button
                                key={country.label}
                                type="button"
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm"
                                onClick={() => {
                                  updateField("country", country.label)
                                  setCountrySearch("")
                                  setShowCountryDropdown(false)
                                }}
                              >
                                <span>{country.flag}</span>
                                <span>{country.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="feeStatus" className="text-sm font-medium text-slate-700">
                        Fee Status <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.feeStatus} onValueChange={(value) => updateField("feeStatus", value)} required>
                        <SelectTrigger className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 rounded-lg">
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="International">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Information */}
              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Academic Information
                  </h3>

                  <div className="space-y-1.5">
                    <Label htmlFor="schoolName" className="text-sm font-medium text-slate-700">
                      Current School / College <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={(e) => updateField("schoolName", e.target.value)}
                      className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full"
                      placeholder="If graduated, state sixth form & university attended"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="yearOfStudy" className="text-sm font-medium text-slate-700">
                        Year of Study <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.yearOfStudy} onValueChange={(value) => updateField("yearOfStudy", value)} required>
                        <SelectTrigger className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 rounded-lg">
                          <SelectItem value="Year 7">Year 7</SelectItem>
                          <SelectItem value="Year 8">Year 8</SelectItem>
                          <SelectItem value="Year 9">Year 9</SelectItem>
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
                    <div className="space-y-1.5">
                      <Label htmlFor="universityEntryYear" className="text-sm font-medium text-slate-700">
                        University Entry Year <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.universityEntryYear} onValueChange={(value) => updateField("universityEntryYear", value)} required>
                        <SelectTrigger className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 rounded-lg">
                          {[2026, 2027, 2028, 2029, 2030].map((year) => (
                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="subject" className="text-sm font-medium text-slate-700">
                        Subject Applying For <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.subject} onValueChange={(value) => updateField("subject", value)} required>
                        <SelectTrigger className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full">
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
                    <div className="space-y-1.5">
                      <Label htmlFor="studentDOB" className="text-sm font-medium text-slate-700">
                        Student Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="studentDOB"
                        type="date"
                        value={formData.studentDOB}
                        onChange={(e) => updateField("studentDOB", e.target.value)}
                        className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Additional Information */}
              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Additional Information
                  </h3>

                  <div className="space-y-1.5">
                    <Label htmlFor="howDidYouHearAboutUs" className="text-sm font-medium text-slate-700">
                      How Did You Hear About Us?
                    </Label>
                    <Input
                      id="howDidYouHearAboutUs"
                      value={formData.howDidYouHearAboutUs}
                      onChange={(e) => updateField("howDidYouHearAboutUs", e.target.value)}
                      className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full"
                      placeholder="e.g., Google search, friend referral, agent, school counsellor..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
                      Notes / Additional Information
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      className="border-slate-300 text-slate-900 rounded-lg min-h-28 text-sm resize-y"
                      placeholder="Please provide any additional information that would be helpful..."
                    />
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {stepError && (
                <div className="mt-5 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-sm text-red-800">{stepError}</p>
                </div>
              )}

              {submitStatus === "success" && (
                <div className="mt-5 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                  <p className="text-sm text-green-800">
                    Thank you! Your assessment request has been submitted successfully.
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mt-5 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-sm text-red-800">
                    There was an error submitting your request. Please try again.
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center gap-3 pt-6 mt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    if (step > 1) { setStep((prev) => (prev - 1) as 1 | 2 | 3); setStepError(null) }
                    else { setIsOpen(false); resetForm() }
                  }}
                  className="h-10 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium px-5"
                  disabled={isSubmitting}
                >
                  {step === 1 ? "Cancel" : "Back"}
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    className="h-10 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium px-6"
                    onClick={(e) => {
                      e.preventDefault()
                      if (!validateStep(step)) return
                      setStepError(null)
                      setStep((step + 1) as 2 | 3)
                    }}
                    disabled={isSubmitting}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="h-10 bg-[#D4AF37] text-slate-950 hover:bg-[#C9A432] rounded-lg font-medium px-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}