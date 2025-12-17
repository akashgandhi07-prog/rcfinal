# Email Setup for Suitability Assessment Form

The suitability assessment form sends emails to `info@regentsconsultancy.co.uk`. You need to configure an email service.

## Option 1: Using Resend (Recommended - Easiest)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Verify your domain `regentsconsultancy.co.uk` (or use their test domain for development)
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```
5. Uncomment the Resend code in `app/api/send-assessment-email/route.ts`

## Option 2: Using Nodemailer with SMTP

1. Install nodemailer:
   ```bash
   npm install nodemailer
   npm install --save-dev @types/nodemailer
   ```

2. Add to `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

3. Update the API route to use nodemailer

## Option 3: Using SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Add to `.env.local`:
   ```
   SENDGRID_API_KEY=SG.your_api_key_here
   ```

## Option 4: Using Vercel Email (If deployed on Vercel)

Vercel has built-in email support. Check their documentation.

## Current Status

Currently, the API route logs the email content to the console for development/testing. In production, you must configure one of the above options.




