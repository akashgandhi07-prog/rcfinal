// Input validation and sanitization utilities

export function sanitizeString(input: string): string {
  if (typeof input !== "string") return ""
  return input.trim().replace(/[<>]/g, "")
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== "string") return ""
  const sanitized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(sanitized) ? sanitized : ""
}

export function sanitizePhone(phone: string): string {
  if (typeof phone !== "string") return ""
  // Remove all non-digit characters except + and spaces
  return phone.replace(/[^\d+\s]/g, "").trim()
}

export function sanitizeHTML(html: string): string {
  if (typeof html !== "string") return ""
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Basic phone validation - at least 10 digits
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 10
}

export function validateRequired(value: string | null | undefined): boolean {
  return !!value && value.trim().length > 0
}

export function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export function validateUCATScore(score: number | null | undefined): boolean {
  if (score === null || score === undefined) return true // Optional field
  return Number.isInteger(score) && score >= 300 && score <= 900
}

export function validateTotalScore(score: number | null | undefined): boolean {
  if (score === null || score === undefined) return true // Optional field
  return Number.isInteger(score) && score >= 1200 && score <= 3600
}

export function validateSJTBand(band: string | null | undefined): boolean {
  if (!band) return true // Optional field
  return ["Band 1", "Band 2", "Band 3", "Band 4"].includes(band)
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4 // 0 = very weak, 4 = very strong
  feedback: string[]
  isValid: boolean
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  if (password.length < 8) {
    feedback.push("Password must be at least 8 characters long")
    return { score: 0, feedback, isValid: false }
  }

  // Length checks
  if (password.length >= 8) score++
  if (password.length >= 12) score++

  // Character variety checks
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (hasLowercase) score++
  if (hasUppercase) score++
  if (hasNumbers) score++
  if (hasSpecial) score++

  // Cap at 4
  score = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4

  // Provide feedback
  if (!hasLowercase) feedback.push("Add lowercase letters")
  if (!hasUppercase) feedback.push("Add uppercase letters")
  if (!hasNumbers) feedback.push("Add numbers")
  if (!hasSpecial) feedback.push("Add special characters")

  const isValid = score >= 2 && password.length >= 8

  return { score, feedback, isValid }
}




