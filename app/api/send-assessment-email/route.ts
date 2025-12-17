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
      firstName: sanitizeString(formData.firstName || ""),
      lastName: sanitizeString(formData.lastName || ""),
      email: sanitizeEmail(formData.email || ""),
      phoneNumber: sanitizeString(formData.phoneNumber || ""),
      isStudent: sanitizeString(formData.isStudent || ""),
      country: sanitizeString(formData.country || ""),
      feeStatus: sanitizeString(formData.feeStatus || ""),
      schoolName: sanitizeString(formData.schoolName || ""),
      universityEntryYear: sanitizeString(formData.universityEntryYear || ""),
      subject: sanitizeString(formData.subject || ""),
      studentDOB: sanitizeString(formData.studentDOB || ""),
      yearOfStudy: sanitizeString(formData.yearOfStudy || ""),
      howDidYouHearAboutUs: sanitizeString(formData.howDidYouHearAboutUs || ""),
      notes: sanitizeHTML(formData.notes || ""),
    }

    // Validate required fields
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
    if (!validateRequired(sanitizedData.isStudent)) {
      return NextResponse.json({ error: "Please specify if you are a student or guardian" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.country)) {
      return NextResponse.json({ error: "Country is required" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.feeStatus)) {
      return NextResponse.json({ error: "Fee status is required" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.schoolName)) {
      return NextResponse.json({ error: "School name is required" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.universityEntryYear)) {
      return NextResponse.json({ error: "University entry year is required" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.subject)) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.studentDOB)) {
      return NextResponse.json({ error: "Student date of birth is required" }, { status: 400 })
    }
    if (!validateRequired(sanitizedData.yearOfStudy)) {
      return NextResponse.json({ error: "Year of study is required" }, { status: 400 })
    }

    // Format email content (using sanitized data)
    const emailContent = `
New Suitability Assessment Request

PERSONAL INFORMATION:
- Name: ${sanitizedData.firstName} ${sanitizedData.lastName}
- Email: ${sanitizedData.email}
- Phone: ${sanitizedData.phoneNumber}
- Role: ${sanitizedData.isStudent}
- Country: ${sanitizedData.country}
- Fee Status: ${sanitizedData.feeStatus}

ACADEMIC INFORMATION:
- School/College: ${sanitizedData.schoolName}
- University Entry Year: ${sanitizedData.universityEntryYear}
- Year of Study: ${sanitizedData.yearOfStudy}
- Subject: ${sanitizedData.subject}
- Student Date of Birth: ${sanitizedData.studentDOB}

ADDITIONAL INFORMATION:
- How Did You Hear About Us: ${sanitizedData.howDidYouHearAboutUs || "Not specified"}
${sanitizedData.notes ? `- Notes: ${sanitizedData.notes}` : "No additional notes provided."}

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
            from: "Suitability Assessment <noreply@regentsconsultancy.co.uk>",
            to: "info@regentsconsultancy.co.uk",
            replyTo: sanitizedData.email,
            subject: `New Suitability Assessment Request - ${sanitizedData.firstName} ${sanitizedData.lastName}`,
            text: emailContent,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
                  New Suitability Assessment Request
                </h2>
                
                <h3 style="color: #0B1120; margin-top: 20px;">Personal Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px; font-weight: bold;">Name:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.firstName)} ${escapeHtml(sanitizedData.lastName)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Email:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.email)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Phone:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.phoneNumber)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Role:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.isStudent)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Country:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.country)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Fee Status:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.feeStatus)}</td></tr>
                </table>

                <h3 style="color: #0B1120; margin-top: 20px;">Academic Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px; font-weight: bold;">School/College:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.schoolName)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">University Entry Year:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.universityEntryYear)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Year of Study:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.yearOfStudy)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Subject:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.subject)}</td></tr>
                  <tr><td style="padding: 5px; font-weight: bold;">Student DOB:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.studentDOB)}</td></tr>
                </table>

                <h3 style="color: #0B1120; margin-top: 20px;">Additional Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  ${sanitizedData.howDidYouHearAboutUs ? `<tr><td style="padding: 5px; font-weight: bold;">How Did You Hear About Us:</td><td style="padding: 5px;">${escapeHtml(sanitizedData.howDidYouHearAboutUs)}</td></tr>` : ''}
                </table>
                ${sanitizedData.notes ? `
                <h3 style="color: #0B1120; margin-top: 20px;">Additional Notes</h3>
                <p style="background: #f5f5f5; padding: 15px; border-left: 3px solid #D4AF37;">${escapeHtml(sanitizedData.notes).replace(/\n/g, '<br>')}</p>
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
      console.log("=== SUITABILITY ASSESSMENT REQUEST ===")
      console.log("To: info@regentsconsultancy.co.uk")
      console.log("Subject: New Suitability Assessment Request -", sanitizedData.firstName, sanitizedData.lastName)
      console.log("\n" + emailContent)
      console.log("=====================================")
      console.log("\n⚠️  RESEND_API_KEY not configured. Email not sent.")
      console.log("Please set up Resend (see EMAIL_SETUP.md) or configure another email service.")
    }

    return NextResponse.json(
      {
        success: true,
        message: "Assessment request submitted successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error sending assessment email:", error)
    return NextResponse.json(
      { error: "Failed to submit assessment request. Please try again or contact us directly." },
      { status: 500 }
    )
  }
}
