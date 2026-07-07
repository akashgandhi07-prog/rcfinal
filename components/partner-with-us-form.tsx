"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { validateEmail } from "@/lib/utils/validation"

const STORAGE_KEY = "partner-with-us-form-data"

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

interface PartnerWithUsFormProps {
  trigger: React.ReactNode
}

export function PartnerWithUsForm({ trigger }: PartnerWithUsFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [formError, setFormError] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const countryDropdownRef = useRef<HTMLDivElement>(null)
  const countryInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    partnershipType: "",
    website: "",
    message: "",
  })

  const validateForm = (): boolean => {
    const { companyName, firstName, lastName, email, phoneNumber, country, partnershipType, website } = formData
    
    if (!companyName?.trim()) {
      setFormError("Company/Organisation name is required.")
      return false
    }
    if (!firstName?.trim()) {
      setFormError("First name is required.")
      return false
    }
    if (!lastName?.trim()) {
      setFormError("Last name is required.")
      return false
    }
    if (!email?.trim()) {
      setFormError("Email address is required.")
      return false
    }
    if (!validateEmail(email)) {
      setFormError("Please enter a valid email address.")
      return false
    }
    if (!phoneNumber?.trim()) {
      setFormError("Phone number is required.")
      return false
    }
    if (!country?.trim()) {
      setFormError("Country is required.")
      return false
    }
    if (!partnershipType?.trim()) {
      setFormError("Partnership type is required.")
      return false
    }
    // Validate website URL if provided
    if (website?.trim() && !website.match(/^https?:\/\/.+/)) {
      setFormError("Please enter a valid website URL (must start with http:// or https://).")
      return false
    }
    
    setFormError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || hasSubmitted) return
    if (!validateForm()) {
      // Scroll to error message
      setTimeout(() => {
        const errorElement = document.querySelector('[data-form-error]')
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setHasSubmitted(true)
    setFormError(null)

    try {
      const response = await fetch("/api/send-partner-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to send email")
      }

      setSubmitStatus("success")
      // Clear saved form data from localStorage on successful submission
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error("Error clearing saved form data:", error)
      }
      
      // Scroll to success message
      setTimeout(() => {
        const successElement = document.querySelector('[data-form-success]')
        if (successElement) {
          successElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
      
      // Don't close immediately - show success message for longer
      setTimeout(() => {
        setFormData({
          companyName: "",
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          country: "",
          partnershipType: "",
          website: "",
          message: "",
        })
        setHasSubmitted(false)
        setIsOpen(false)
        setSubmitStatus("idle")
        setCountrySearch("")
        setShowCountryDropdown(false)
      }, 5000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitStatus("error")
      setHasSubmitted(false)
      setFormError(error instanceof Error ? error.message : "There was an error submitting your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Load saved form data from localStorage when dialog opens
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.formData) {
            setFormData(parsed.formData)
          }
        }
      } catch (error) {
        console.error("Error loading saved form data:", error)
      }
    }
  }, [isOpen])

  // Auto-save form data to localStorage whenever formData changes
  useEffect(() => {
    if (isOpen && !hasSubmitted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          formData,
        }))
      } catch (error) {
        console.error("Error saving form data:", error)
      }
    }
  }, [formData, isOpen, hasSubmitted])

  // Handle click outside country dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node) &&
        countryInputRef.current &&
        !countryInputRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false)
        setCountrySearch("")
      }
    }

    if (showCountryDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [showCountryDropdown])

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setSubmitStatus("idle")
    setFormError(null)
    setHasSubmitted(false)
    setCountrySearch("")
    setShowCountryDropdown(false)
    setFormData({
      companyName: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      country: "",
      partnershipType: "",
      website: "",
      message: "",
    })
    // Clear saved form data from localStorage
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing saved form data:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm() }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="bg-white border-slate-200 w-[calc(100vw-2rem)] max-w-3xl sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-xl sm:rounded-2xl p-0"
        aria-describedby="partner-form-description"
      >
        <div className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-200 flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-serif text-slate-900 font-light">
              Partner With Us
            </DialogTitle>
            <p id="partner-form-description" className="sr-only">
              Form for agents and companies interested in partnering with Regent's Consultancy.
            </p>
          </DialogHeader>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
            <form 
              onSubmit={handleSubmit} 
              className="px-4 sm:px-6 py-4 sm:py-6"
              onKeyDown={(e) => {
                // Prevent form submission on Enter in text fields (except textarea)
                if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                  e.preventDefault()
                }
              }}
            >
              <div className="space-y-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Company Information
                </h3>
                
                <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">
                    Company / Organisation Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full"
                    placeholder="Enter company or organisation name"
                    required
                    autoComplete="organization"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="partnershipType" className="text-sm font-medium text-slate-700">
                      Type of Partnership <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.partnershipType} onValueChange={(value) => updateField("partnershipType", value)} required>
                      <SelectTrigger className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 rounded-lg">
                        <SelectItem value="Education Agent">Education Agent</SelectItem>
                        <SelectItem value="Recruitment Agency">Recruitment Agency</SelectItem>
                        <SelectItem value="Educational Institution">Educational Institution</SelectItem>
                        <SelectItem value="Corporate Partner">Corporate Partner</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="website" className="text-sm font-medium text-slate-700">
                      Website URL
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      className="h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full"
                      placeholder="https://example.com"
                      autoComplete="url"
                    />
                  </div>
                </div>

                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">
                  Contact Information
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
                      placeholder="Enter first name"
                      required
                      autoComplete="given-name"
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
                      placeholder="Enter last name"
                      required
                      autoComplete="family-name"
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
                      placeholder="your.email@example.com"
                      required
                      autoComplete="email"
                    />
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
                </div>

                <div className="space-y-1.5 relative">
                  <Label htmlFor="country" className="text-sm font-medium text-slate-700">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="relative">
                      {formData.country && !countrySearch && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                          {COUNTRIES.find(c => c.label === formData.country)?.flag}
                        </div>
                      )}
                      <Input
                        ref={countryInputRef}
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
                        onBlur={() => {
                          // Delay to allow click on dropdown item
                          setTimeout(() => {
                            if (!countryDropdownRef.current?.contains(document.activeElement)) {
                              setShowCountryDropdown(false)
                              if (countrySearch && !COUNTRIES.some(c => c.label === countrySearch)) {
                                setCountrySearch("")
                              }
                            }
                          }, 200)
                        }}
                        className={`h-10 border-slate-300 text-slate-900 rounded-lg text-sm w-full ${formData.country && !countrySearch ? 'pl-9' : ''}`}
                        placeholder="Type to search country..."
                        required
                        autoComplete="country-name"
                      />
                    </div>
                    {showCountryDropdown && (countrySearch || !formData.country) && (
                      <div 
                        ref={countryDropdownRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-[300px] overflow-y-auto"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {COUNTRIES.filter((country) =>
                          !countrySearch || country.label.toLowerCase().includes(countrySearch.toLowerCase())
                        ).slice(0, 20).map((country) => (
                          <button
                            key={country.label}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-slate-50 active:bg-slate-100 flex items-center gap-2 text-sm text-slate-900 transition-colors"
                            onClick={() => {
                              updateField("country", country.label)
                              setCountrySearch("")
                              setShowCountryDropdown(false)
                              countryInputRef.current?.blur()
                            }}
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-slate-900">{country.label}</span>
                          </button>
                        ))}
                        {COUNTRIES.filter((country) =>
                          !countrySearch || country.label.toLowerCase().includes(countrySearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-2 text-sm text-slate-500 text-center">
                            No countries found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">
                  Additional Information
                </h3>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm font-medium text-slate-700">
                    Message / Inquiry
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className="border-slate-300 text-slate-900 rounded-lg min-h-32 text-sm resize-y"
                    placeholder="Please tell us about your organisation and how you'd like to partner with us..."
                  />
                </div>
              </div>

              {/* Error/Success Messages */}
              {formError && (
                <div data-form-error className="mt-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-sm text-red-800 font-medium">{formError}</p>
                </div>
              )}

              {submitStatus === "success" && (
                <div data-form-success className="mt-5 p-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                  <h4 className="text-lg font-semibold text-green-900 mb-2">
                    Thank You!
                  </h4>
                  <p className="text-sm text-green-800 leading-relaxed">
                    We have received your partnership inquiry. Thank you for your interest in partnering with us. We will be in touch with you shortly.
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mt-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-sm text-red-800 font-medium">
                    {formError || "There was an error submitting your request. Please try again."}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-6 mt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsOpen(false)
                    resetForm()
                  }}
                  className="h-10 w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium px-5"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="h-10 w-full sm:w-auto bg-[#D4AF37] text-slate-950 hover:bg-[#C9A432] rounded-lg font-medium px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || hasSubmitted}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Inquiry"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

