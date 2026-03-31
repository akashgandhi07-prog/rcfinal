# Simplified Login Process

## Overview
The login process has been simplified to make it straightforward for both regular users and admins.

## User Registration Flow

1. **User registers** with email, password, and account type (Student/Parent/Mentor)
2. **Account is created** with `approval_status: "pending"`
3. **Appears in Admin Dashboard** under "Accounts Awaiting Approval"
4. **Admin approves or rejects** the account
5. **User can login** once approved

## Admin Login Flow

### Admin Accounts
- `akashgandhi07@gmail.com`
- `akashgandhi07+test@gmail.com`

### How to Login as Admin

**Option 1: Direct Login (Simplest)**
1. Go to `/portal` login page
2. Enter your admin email (`akashgandhi07@gmail.com` or `akashgandhi07+test@gmail.com`)
3. Enter your password
4. Click "Secure Login"
5. You'll automatically be granted admin role and approved

**Option 2: Using Admin Button**
1. Go to `/portal` login page
2. Click the "ADMIN" button
3. Select which admin email you want to use
4. The email will be pre-filled
5. Enter your password and login

### Auto-Admin Features
- Admin emails are automatically detected during login
- Admin accounts are automatically granted `admin` role
- Admin accounts are automatically approved
- Admin accounts skip onboarding (set to `complete`)

## Setup Admin Accounts

### If Admin Accounts Don't Exist Yet

1. **Create Auth User in Supabase Dashboard:**
   - Go to **Authentication > Users**
   - Click **"Add User"**
   - Enter:
     - Email: `akashgandhi07@gmail.com` (or `akashgandhi07+test@gmail.com`)
     - Password: (choose a secure password)
     - **Enable "Auto Confirm User"**
   - Click **"Create User"**
   - **Copy the User ID**

2. **Create User Profile:**
   - Go to **SQL Editor** in Supabase
   - Run:
   ```sql
   INSERT INTO public.users (id, email, role, approval_status, onboarding_status)
   VALUES (
     'PASTE-USER-ID-HERE',
     'akashgandhi07@gmail.com',
     'admin',
     'approved',
     'complete'
   )
   ON CONFLICT (id) DO UPDATE SET
     role = 'admin',
     approval_status = 'approved',
     onboarding_status = 'complete';
   ```

### If Admin Accounts Already Exist

Run this SQL to ensure they're set up correctly:

```sql
UPDATE public.users
SET 
  role = 'admin',
  approval_status = 'approved',
  onboarding_status = 'complete'
WHERE email IN ('akashgandhi07@gmail.com', 'akashgandhi07+test@gmail.com');
```

Or use the script: `supabase/setup-admin-accounts.sql`

## What Changed

### Before
- Admin login required a password dialog ("Junojuno")
- After password, still needed to login with email/password
- Admin role elevation was session-based

### After
- Admin emails are auto-detected
- Direct login with admin email/password
- Admin role is automatically granted and persisted
- No password dialog needed (optional admin button for convenience)

## Security Notes

- Admin emails are hardcoded in the login flow
- Admin accounts are automatically approved
- Regular users still require admin approval
- All security policies (RLS) remain in place

