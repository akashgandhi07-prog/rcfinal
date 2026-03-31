-- ============================================
-- SETUP ADMIN ACCOUNTS FOR REGENT'S CONSULTANCY
-- ============================================
-- This script ensures admin accounts are properly configured
-- Run this in Supabase SQL Editor

-- Admin emails
-- akashgandhi07@gmail.com
-- akashgandhi07+test@gmail.com

-- ============================================
-- STEP 1: Update existing users to admin (if they exist)
-- ============================================
-- This will update any existing users with admin emails to have admin role

UPDATE public.users
SET 
  role = 'admin',
  approval_status = 'approved',
  onboarding_status = 'complete'
WHERE email IN ('akashgandhi07@gmail.com', 'akashgandhi07+test@gmail.com')
  AND role != 'admin';

-- ============================================
-- STEP 2: Verify admin accounts
-- ============================================
-- Run this to check if admin accounts are set up correctly

SELECT 
  id,
  email,
  role,
  approval_status,
  onboarding_status,
  created_at
FROM public.users
WHERE email IN ('akashgandhi07@gmail.com', 'akashgandhi07+test@gmail.com');

-- ============================================
-- NOTES:
-- ============================================
-- 1. You still need to create the auth users in Supabase Dashboard:
--    - Go to Authentication > Users
--    - Click "Add User"
--    - Enter email and password
--    - Enable "Auto Confirm User"
--    - Copy the User ID
--
-- 2. Then run this to link the auth user to the profile:
--    UPDATE public.users
--    SET id = 'PASTE-USER-ID-HERE'
--    WHERE email = 'akashgandhi07@gmail.com';
--
-- 3. Or create the profile with the auth user ID:
--    INSERT INTO public.users (id, email, role, approval_status, onboarding_status)
--    VALUES (
--      'PASTE-USER-ID-HERE',
--      'akashgandhi07@gmail.com',
--      'admin',
--      'approved',
--      'complete'
--    )
--    ON CONFLICT (id) DO UPDATE SET
--      role = 'admin',
--      approval_status = 'approved',
--      onboarding_status = 'complete';

