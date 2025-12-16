-- ============================================
-- CREATE DEMO ACCOUNTS FOR REGENT'S CONSULTANCY
-- ============================================
-- Run this in Supabase SQL Editor
-- Note: You'll need to create auth users first, then update their profiles
-- OR use the admin interface in the app to create demo accounts

-- ============================================
-- OPTION 1: Create demo accounts via Supabase Auth + Users table
-- ============================================
-- First, create auth users in Supabase Dashboard > Authentication > Users
-- Then run these to create/update their profiles:

-- Demo Admin Account
INSERT INTO public.users (id, email, role, full_name, approval_status, onboarding_status, target_course)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@regents-demo.com',
  'admin',
  'Demo Admin',
  'approved',
  'complete',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  approval_status = 'approved',
  onboarding_status = 'complete';

-- Demo Student Account (Medicine)
INSERT INTO public.users (id, email, role, full_name, approval_status, onboarding_status, target_course, entry_year, country, fee_status)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'student.medicine@regents-demo.com',
  'student',
  'Demo Student - Medicine',
  'approved',
  'complete',
  'medicine',
  2027,
  'United Kingdom',
  'home'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'student',
  approval_status = 'approved',
  onboarding_status = 'complete',
  target_course = 'medicine',
  entry_year = 2027,
  country = 'United Kingdom',
  fee_status = 'home';

-- Demo Student Account (Dentistry)
INSERT INTO public.users (id, email, role, full_name, approval_status, onboarding_status, target_course, entry_year, country, fee_status)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'student.dentistry@regents-demo.com',
  'student',
  'Demo Student - Dentistry',
  'approved',
  'complete',
  'dentistry',
  2027,
  'United Kingdom',
  'home'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'student',
  approval_status = 'approved',
  onboarding_status = 'complete',
  target_course = 'dentistry',
  entry_year = 2027,
  country = 'United Kingdom',
  fee_status = 'home';

-- Demo Student Account (Veterinary)
INSERT INTO public.users (id, email, role, full_name, approval_status, onboarding_status, target_course, entry_year, country, fee_status)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'student.veterinary@regents-demo.com',
  'student',
  'Demo Student - Veterinary',
  'approved',
  'complete',
  'veterinary',
  2027,
  'United Kingdom',
  'home'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'student',
  approval_status = 'approved',
  onboarding_status = 'complete',
  target_course = 'veterinary',
  entry_year = 2027,
  country = 'United Kingdom',
  fee_status = 'home';

-- Demo Mentor Account
INSERT INTO public.users (id, email, role, full_name, approval_status, onboarding_status, target_course)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'mentor@regents-demo.com',
  'mentor',
  'Demo Mentor',
  'approved',
  'complete',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  role = 'mentor',
  approval_status = 'approved',
  onboarding_status = 'complete';

-- Demo Parent Account
INSERT INTO public.users (id, email, role, full_name, approval_status, onboarding_status, target_course)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'parent@regents-demo.com',
  'parent',
  'Demo Parent',
  'approved',
  'complete',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  role = 'parent',
  approval_status = 'approved',
  onboarding_status = 'complete';

-- ============================================
-- OPTION 2: View all demo accounts
-- ============================================
SELECT 
  id,
  email,
  role,
  full_name,
  target_course,
  approval_status,
  onboarding_status,
  entry_year,
  country,
  fee_status
FROM public.users
WHERE email LIKE '%@regents-demo.com'
ORDER BY role, email;

-- ============================================
-- OPTION 3: Delete all demo accounts (if needed)
-- ============================================
-- WARNING: This will delete demo accounts from the users table
-- You'll also need to delete them from Auth > Users in Supabase Dashboard
-- DELETE FROM public.users WHERE email LIKE '%@regents-demo.com';

