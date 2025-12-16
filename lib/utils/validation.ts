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



