import { NextRequest, NextResponse } from "next/server"
import { rateLimit, getClientIdentifier } from "@/lib/utils/rate-limit"
import { sanitizeString, sanitizeEmail, sanitizeHTML, validateEmail, validateRequired } from "@/lib/utils/validation"

export const runtime = 'edge'

// HTML escaping function to prevent XSS in email templates
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// Replace template tokens with actual values
function replaceTokens(template: string, data: Record<string, string>): string {
  let result = template
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    result = result.replace(regex, escapeHtml(value || ''))
  })
  return result
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - more permissive for admin operations
    const clientId = getClientIdentifier(request)
    const limit = rateLimit(clientId, 20, 60000) // 20 requests per minute
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { 
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
          },
        }
      )
    }

    const body = await request.json()
    const { recipients, subject, htmlContent, textContent, template, templateData, fromName } = body

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "At least one recipient is required" }, { status: 400 })
    }

    // Validate all email addresses
    for (const email of recipients) {
      if (!validateEmail(email)) {
        return NextResponse.json({ error: `Invalid email address: ${email}` }, { status: 400 })
      }
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 })
    }

    // Use template or provided content
    let finalHtmlContent = htmlContent || ""
    let finalTextContent = textContent || ""

    if (template && templateData) {
      // Apply template with data
      finalHtmlContent = replaceTokens(template, templateData)
      finalTextContent = replaceTokens(template.replace(/<[^>]*>/g, ''), templateData) // Strip HTML for text
    }

    if (!finalHtmlContent && !finalTextContent) {
      return NextResponse.json({ error: "Email content is required" }, { status: 400 })
    }

    // Sanitize content
    const sanitizedSubject = sanitizeString(subject)
    const sanitizedHtml = finalHtmlContent ? sanitizeHTML(finalHtmlContent) : ""
    const sanitizedText = finalTextContent ? sanitizeString(finalTextContent) : ""

    // Get Resend API key
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured")
      return NextResponse.json(
        { error: "Email service not configured. Please contact system administrator." },
        { status: 500 }
      )
    }

    const senderName = fromName || "Regent's Consultancy"
    const senderEmail = "noreply@regentsconsultancy.co.uk"

    // Send emails (handle both single and bulk)
    const results = []
    const errors = []

    for (const recipient of recipients) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `${senderName} <${senderEmail}>`,
            to: recipient,
            subject: sanitizedSubject,
            html: sanitizedHtml,
            text: sanitizedText,
            replyTo: "info@regentsconsultancy.co.uk",
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          errors.push({ recipient, error: errorData.message || "Failed to send email" })
        } else {
          const result = await response.json()
          results.push({ recipient, emailId: result.id })
        }
      } catch (emailError) {
        console.error(`Error sending email to ${recipient}:`, emailError)
        errors.push({ 
          recipient, 
          error: emailError instanceof Error ? emailError.message : "Unknown error" 
        })
      }
    }

    // Return results
    if (errors.length > 0 && results.length === 0) {
      // All failed
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to send all emails", 
          errors,
          sent: results.length,
          failed: errors.length,
        },
        { status: 500 }
      )
    } else if (errors.length > 0) {
      // Some failed
      return NextResponse.json({
        success: true,
        message: `Sent ${results.length} email(s), ${errors.length} failed`,
        results,
        errors,
        sent: results.length,
        failed: errors.length,
      })
    } else {
      // All succeeded
      return NextResponse.json({
        success: true,
        message: `Successfully sent ${results.length} email(s)`,
        results,
        sent: results.length,
        failed: 0,
      })
    }
  } catch (error) {
    console.error("Error in send-admin-email:", error)
    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    )
  }
}

