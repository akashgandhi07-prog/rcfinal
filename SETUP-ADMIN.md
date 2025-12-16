# How to Login as Admin

## Step 1: Create Your Admin Account

You have two options:

### Option A: Change an Existing User to Admin (Easiest)

1. **Go to Supabase Dashboard**
   - Open your Supabase project
   - Navigate to **SQL Editor**

2. **Run this SQL query** (replace with your email):
   ```sql
   UPDATE public.users
   SET role = 'admin', approval_status = 'approved', onboarding_status = 'complete'
   WHERE email = 'your-email@example.com';
   ```

3. **Verify it worked**:
   ```sql
   SELECT email, role, approval_status 
   FROM public.users 
   WHERE email = 'your-email@example.com';
   ```

### Option B: Create a New Admin Account

1. **Create Auth User in Supabase**
   - Go to **Authentication > Users**
   - Click **"Add User"**
   - Enter:
     - Email: `admin@yourdomain.com` (or your email)
     - Password: (choose a secure password)
     - **Enable "Auto Confirm User"**
   - Click **"Create User"**
   - **Copy the User ID** (you'll need it)

2. **Create User Profile in Database**
   - Go to **SQL Editor**
   - Run this (replace with your email and the User ID from step 1):
   ```sql
   INSERT INTO public.users (id, email, role, approval_status, onboarding_status)
   VALUES (
     'PASTE-USER-ID-HERE',
     'admin@yourdomain.com',
     'admin',
     'approved',
     'complete'
   );
   ```

## Step 2: Login to the Portal

1. **Go to your portal login page** (usually `/portal`)

2. **Enter your credentials**:
   - Email: The email you used above
   - Password: The password you set

3. **Click "Secure Login"**

4. **You should now see the Admin section** in the sidebar!

## Quick Setup Script

If you want to quickly set up an admin account, run this in Supabase SQL Editor (replace the email):

```sql
-- First, check if user exists
SELECT id, email, role 
FROM public.users 
WHERE email = 'your-email@example.com';

-- If user exists, make them admin:
UPDATE public.users
SET 
  role = 'admin',
  approval_status = 'approved',
  onboarding_status = 'complete'
WHERE email = 'your-email@example.com';

-- If user doesn't exist, you need to:
-- 1. Create auth user in Authentication > Users
-- 2. Then run the INSERT query from Option B above
```

## Troubleshooting

**Problem: "Account pending approval"**
- Solution: Make sure `approval_status = 'approved'` in the database

**Problem: Can't see Admin section**
- Solution: Verify `role = 'admin'` in the database

**Problem: "User not found"**
- Solution: Make sure you created the auth user in Authentication > Users first

**Problem: Can't login**
- Solution: Make sure the auth user exists in Authentication > Users with the same email

## Verify Admin Access

After logging in, you should see:
- "Admin" option in the sidebar
- "All Users" table showing all accounts
- Ability to edit user roles
- Ability to create demo accounts

