"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MatteInput } from "@/components/ui/matte-input"
import { MatteTextarea } from "@/components/ui/matte-textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"
import type { TargetCourse } from "@/lib/supabase/types"

export interface OnboardingData {
  // Step 1: Personal Details
  full_name: string
  date_of_birth: string
  home_address: string
  contact_number: string
  parent_name: string
  parent_phone: string
  parent_email: string
  parent2_name: string
  parent2_phone: string
  parent2_email: string

  // Step 2: Academic Baseline
  school_name: string
  gcse_summary: string
  a_level_predictions: string

  // Step 3: Course Selection
  target_course: TargetCourse | null
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => Promise<void>
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: "",
    date_of_birth: "",
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
    target_course: null,
  })

  const updateField = (field: keyof OnboardingData, value: string | TargetCourse | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.full_name &&
          formData.date_of_birth &&
          formData.home_address &&
          formData.contact_number &&
          formData.parent_name &&
          formData.parent_phone &&
          formData.parent_email
        )
      case 2:
        return !!(formData.school_name && formData.gcse_summary && formData.a_level_predictions)
      case 3:
        return !!formData.target_course
      default:
        return false
    }
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
    { number: 3, title: "Course Selection", description: "Your target clinical course" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
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
                        className="text-sm w-full"
                        placeholder="Ella Lewis"
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
                        className="text-sm w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact_number" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                      Contact Number *
                    </Label>
                    <MatteInput
                      id="contact_number"
                      value={formData.contact_number}
                      onChange={(e) => updateField("contact_number", e.target.value)}
                      className="text-sm w-full"
                      placeholder="+44 7700 900123"
                    />
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
                      className="text-sm w-full"
                      placeholder="24 Kensington Gardens, London, W8 4RT"
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-serif text-slate-900 mb-6 font-light">Parent/Guardian 1</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="parent_name" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Parent Name *
                        </Label>
                        <MatteInput
                          id="parent_name"
                          value={formData.parent_name}
                          onChange={(e) => updateField("parent_name", e.target.value)}
                          className="text-sm w-full"
                          placeholder="Sarah Lewis"
                        />
                      </div>

                      <div>
                        <Label htmlFor="parent_phone" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Parent Phone *
                        </Label>
                        <MatteInput
                          id="parent_phone"
                          value={formData.parent_phone}
                          onChange={(e) => updateField("parent_phone", e.target.value)}
                          className="text-sm w-full"
                          placeholder="+44 7700 900456"
                        />
                      </div>

                      <div>
                        <Label htmlFor="parent_email" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Parent Email *
                        </Label>
                        <MatteInput
                          id="parent_email"
                          type="email"
                          value={formData.parent_email}
                          onChange={(e) => updateField("parent_email", e.target.value)}
                          className="text-sm w-full"
                          placeholder="parent@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-serif text-slate-900 mb-6 font-light">Parent/Guardian 2 (Optional)</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="parent2_name" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Parent Name
                        </Label>
                        <MatteInput
                          id="parent2_name"
                          value={formData.parent2_name}
                          onChange={(e) => updateField("parent2_name", e.target.value)}
                          className="text-sm w-full"
                          placeholder="John Lewis"
                        />
                      </div>

                      <div>
                        <Label htmlFor="parent2_phone" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Parent Phone
                        </Label>
                        <MatteInput
                          id="parent2_phone"
                          value={formData.parent2_phone}
                          onChange={(e) => updateField("parent2_phone", e.target.value)}
                          className="text-sm w-full"
                          placeholder="+44 7700 900789"
                        />
                      </div>

                      <div>
                        <Label htmlFor="parent2_email" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                          Parent Email
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
                      className="text-sm w-full"
                      placeholder="Westminster Academy"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gcse_summary" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                      GCSE Summary *
                    </Label>
                    <MatteTextarea
                      id="gcse_summary"
                      value={formData.gcse_summary}
                      onChange={(e) => updateField("gcse_summary", e.target.value)}
                      rows={3}
                      className="text-sm w-full"
                      placeholder="9 GCSEs - Grade 9-7 (including Maths, English, Sciences)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="a_level_predictions" className="text-xs text-slate-500 uppercase tracking-widest font-light mb-2 block">
                      A-Level Predictions *
                    </Label>
                    <MatteInput
                      id="a_level_predictions"
                      value={formData.a_level_predictions}
                      onChange={(e) => updateField("a_level_predictions", e.target.value)}
                      className="text-sm w-full"
                      placeholder="A*A*A (Biology, Chemistry, Mathematics)"
                    />
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
                      <SelectTrigger className="border-0 border-b border-slate-300 rounded-none px-0 py-3 focus:border-[#D4AF37] focus:ring-0 bg-transparent font-light text-slate-900 h-auto">
                        <SelectValue placeholder="Select your target course" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 rounded-none">
                        <SelectItem value="medicine">Medicine</SelectItem>
                        <SelectItem value="dentistry">Dentistry</SelectItem>
                        <SelectItem value="veterinary">Veterinary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.target_course && (
                    <div className="p-6 bg-[#D4AF37]/5 border border-[#D4AF37]/30">
                      <p className="text-sm text-slate-800 font-light leading-relaxed">
                        {formData.target_course === "veterinary" && (
                          <>
                            <strong className="font-medium">Veterinary course selected.</strong> Your dashboard will be customized for
                            veterinary medicine applications. UCAT Performance tracking will not be available as veterinary schools use
                            different assessment methods.
                          </>
                        )}
                        {formData.target_course !== "veterinary" && (
                          <>
                            <strong className="font-medium">Medicine/Dentistry course selected.</strong> Your dashboard will include UCAT
                            and BMAT performance tracking, interview preparation resources, and medical school-specific guidance.
                          </>
                        )}
                      </p>
                    </div>
                  )}
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
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-none uppercase tracking-widest font-light disabled:opacity-30 disabled:cursor-not-allowed px-6"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-none uppercase tracking-widest font-light disabled:opacity-50 disabled:cursor-not-allowed px-8"
              >
                Next Step
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!validateStep(3) || isSubmitting}
                className="bg-[#D4AF37] text-slate-950 hover:bg-[#D4AF37]/90 rounded-none uppercase tracking-widest font-light disabled:opacity-50 disabled:cursor-not-allowed px-8"
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
