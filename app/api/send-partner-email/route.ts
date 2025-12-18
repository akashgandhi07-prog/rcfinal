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

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const limit = rateLimit(clientId, 5, 60000) // 5 requests per minute
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(limit.resetTime),
          },
        }
      )
    }

    const formData = await request.json()

    // Sanitize all inputs
    const sanitizedData = {
      companyName: sanitizeString(formData.companyName || ""),
      firstName: sanitizeString(formData.firstName || ""),
      lastName: sanitizeString(formData.lastName || ""),
      email: sanitizeEmail(formData.email || ""),
      phoneNumber: sanitizeString(formData.phoneNumber || ""),
      country: sanitizeString(formData.country || ""),
      partnershipType: sanitizeString(formData.partnershipType || ""),
      website: sanitizeString(formData.website || ""),
      message: sanitizeHTML(formData.message || ""),
    }

    // Validate required fields
    if (!validateRequired(sanitizedData.companyName)) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.firstName)) {
      return NextResponse.json({ error: "First name is required" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.lastName)) {
      return NextResponse.json({ error: "Last name is required" }, { status: 400 })
    }
    if (!validateEmail(sanitizedData.email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.phoneNumber)) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.country)) {
      return NextResponse.json({ error: "Country is required" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.partnershipType)) {
      return NextResponse.json({ error: "Partnership type is required" }, { status: 400 })
    }

    // Format email content (using sanitized data)
    const emailContent = `
New Partnership Inquiry

COMPANY INFORMATION:
- Company/Organization: ${sanitizedData.companyName}
- Partnership Type: ${sanitizedData.partnershipType}
${sanitizedData.website ? `- Website: ${sanitizedData.website}` : "- Website: Not provided"}

CONTACT INFORMATION:
- Name: ${sanitizedData.firstName} ${sanitizedData.lastName}
- Email: ${sanitizedData.email}
- Phone: ${sanitizedData.phoneNumber}
- Country: ${sanitizedData.country}

ADDITIONAL INFORMATION:
${sanitizedData.message ? `Message: ${sanitizedData.message}` : "No additional message provided."}

---
Submitted: ${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}
    `.trim()

    // Send email using Resend (recommended) or another service
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (RESEND_API_KEY) {
      // Using Resend
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Partnership Inquiry <noreply@regentsconsultancy.co.uk>",
            to: "info@regentsconsultancy.co.uk",
            replyTo: sanitizedData.email,
            subject: `New Partnership Inquiry - ${sanitizedData.companyName}`,
            text: emailContent,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
                  New Partnership Inquiry
                </h2>
                
                <h3 style="color: #0B1120; margin-top: 20px;">Company Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px; font-weight: bold;">Company/Organization:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.companyName)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Partnership Type:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.partnershipType)}</td></tr>
                  ${sanitizedData.website ? `<tr><td style="padding: 5px; font-weight: bold;">Website:</td><td style="padding: 5px;"><a href="${escapeHtml(sanitizedData.website)}" style="color: #D4AF37;">${escapeHtml(sanitizedData.website)}</a></td></tr>` : ''}
                </table>

                <h3 style="color: #0B1120; margin-top: 20px;">Contact Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px; font-weight: bold;">Name:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.firstName)} ${escapeHtml(sanitizedData.lastName)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Email:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.email)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Phone:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.phoneNumber)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Country:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.country)}</td></tr>
                </table>

                ${sanitizedData.message ? `
                <h3 style="color: #0B1120; margin-top: 20px;">Message</h3>
                <p style="background: #f5f5f5; padding: 15px; border-left: 3px solid #D4AF37;">${escapeHtml(sanitizedData.message).replace(/\n/g, '<br>')}</p>
                ` : ''}

                <p style="margin-top: 20px; color: #666; font-size: 12px;">
                  Submitted: ${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}
                </p>
              </div>
            `,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          console.error("Resend API error:", error)
          throw new Error(`Email service error: ${JSON.stringify(error)}`)
        }

        const result = await response.json()
        console.log("Email sent successfully:", result.id)
      } catch (emailError) {
        console.error("Error sending email via Resend:", emailError)
        // Fall through to log email content for debugging
      }
    } else {
      // Development/testing: log the email content
      console.log("=== PARTNERSHIP INQUIRY ===")
      console.log("To: info@regentsconsultancy.co.uk")
      console.log("Subject: New Partnership Inquiry -", sanitizedData.companyName)
      console.log("\n" + emailContent)
      console.log("=====================================")
      console.log("\n⚠️  RESEND_API_KEY not configured. Email not sent.")
      console.log("Please set up Resend (see EMAIL_SETUP.md) or configure another email service.")
    }

    return NextResponse.json(
      {
        success: true,
        message: "Partnership inquiry submitted successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error sending partner email:", error)
    return NextResponse.json(
      { error: "Failed to submit partnership inquiry. Please try again or contact us directly." },
      { status: 500 }
    )
  }
}

