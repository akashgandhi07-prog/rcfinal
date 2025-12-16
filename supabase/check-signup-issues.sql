-- ============================================
-- DIAGNOSTIC SCRIPT: Check Signup Issues
-- ============================================
-- Run this in Supabase SQL Editor to diagnose signup problems

-- 1. Check if user_role enum includes all roles
SELECT 
  'user_role enum values:' as check_type,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as values
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role');

-- 2. Check if all required columns exist
SELECT 
  'users table columns:' as check_type,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public';

-- 3. Check if entry_year, country, fee_status columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
AND column_name IN ('entry_year', 'country', 'fee_status', 'role', 'approval_status', 'onboarding_status')
ORDER BY column_name;

-- 4. Check RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- 5. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'users';

-- 6. Test insert (this will show the actual error if there is one)
-- Uncomment and run with a test UUID to see the error:
/*
INSERT INTO public.users (id, email, role, onboarding_status, approval_status)
VALUES (
  '00000000-0000-0000-0000-000000000999',
  'test@example.com',
  'student',
  'pending',
  'pending'
);
*/

-- 7. Check for any constraints that might block inserts
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
ORDER BY contype, conname;

