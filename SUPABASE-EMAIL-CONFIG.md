# Fix Supabase Email Confirmation Links

## Problem
Confirmation emails are linking to `localhost:3000` instead of your production URL.

## Solution: Configure Supabase URL Settings

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**

### Step 2: Set Site URL

In the **Site URL** field, enter your production URL:
```
https://yourdomain.com
```
or
```
https://your-vercel-app.vercel.app
```

**Important:** This should be your actual production domain, NOT localhost.

### Step 3: Add Redirect URLs

In the **Redirect URLs** section, add these URLs (one per line):

**For Production:**
```
https://yourdomain.com/portal
https://yourdomain.com/portal/*
https://yourdomain.com/portal/reset-password
https://yourdomain.com/**
```

**For Development (optional, if you want to test locally):**
```
http://localhost:3000/portal
http://localhost:3000/portal/*
http://localhost:3000/portal/reset-password
http://localhost:3000/**
```

**Important Notes:**
- The `/**` pattern allows all paths under that domain
- You can add multiple URLs (one per line)
- Make sure to include both `/portal` and `/portal/*` patterns
- Click **Save** after adding URLs

### Step 4: Update Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Click on **Confirm signup** template
3. Check the confirmation link - it should use `{{ .ConfirmationURL }}`
4. The link will automatically use your configured Site URL

### Step 5: Test

1. Try signing up with a new email
2. Check the confirmation email
3. The link should now point to your production URL

## Code Changes

I've also updated the signup code to explicitly pass the redirect URL. The code now uses:
- Production: Your actual domain
- Development: `http://localhost:3000/portal`

## Environment Variables (Optional)

If you want to explicitly set the redirect URL, you can add to `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Then update the code to use this variable if needed.

## Troubleshooting

**Problem: Still seeing localhost in emails**
- Solution: Clear your browser cache and try again
- Make sure you saved the URL Configuration in Supabase
- Wait a few minutes for changes to propagate

**Problem: "Invalid redirect URL" error**
- Solution: Make sure the redirect URL is in the "Redirect URLs" list
- Check for typos in the URL
- Make sure you're using `https://` for production

**Problem: Email not sending**
- Solution: Check Supabase Dashboard → Authentication → Settings
- Make sure "Enable email confirmations" is ON
- Check your email provider settings

## Quick Checklist

- [ ] Site URL set to production domain (not localhost)
- [ ] Redirect URLs include your production domain
- [ ] Redirect URLs include `/portal` and `/portal/*` patterns
- [ ] Clicked "Save" in Supabase Dashboard
- [ ] Tested with a new signup

