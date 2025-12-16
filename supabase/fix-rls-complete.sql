-- ============================================
-- COMPLETE RLS FIX - Run this in Supabase SQL Editor
-- ============================================
-- This fixes all RLS policies to ensure users can access their own data

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Students can view own data" ON public.users;
DROP POLICY IF EXISTS "Students can update own data" ON public.users;
DROP POLICY IF EXISTS "Parents can view own data" ON public.users;
DROP POLICY IF EXISTS "Parents can view linked student data" ON public.users;
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- ============================================
-- BASIC POLICY: Users can ALWAYS view their own data
-- This must be first and simple - no role checks
-- ============================================
CREATE POLICY "Users can view own data"
ON public.users FOR SELECT
USING (auth.uid()::text = id::text);

-- ============================================
-- INSERT POLICY: Users can insert their own profile
-- ============================================
CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- UPDATE POLICY: Users can update their own profile
-- ============================================
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- ADMIN POLICY: Admins can do everything
-- ============================================
CREATE POLICY "Admins have full access to users"
ON public.users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id::text = auth.uid()::text AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id::text = auth.uid()::text AND role = 'admin'
  )
);

-- ============================================
-- PARENT POLICY: Parents can view linked students
-- ============================================
CREATE POLICY "Parents can view linked student data"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parent_student_links
    WHERE parent_id::text = auth.uid()::text
    AND student_id = users.id
  )
);

-- ============================================
-- MENTOR POLICY: Mentors can view linked students
-- ============================================
CREATE POLICY "Mentors can view linked student data"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mentor_student_links
    WHERE mentor_id::text = auth.uid()::text
    AND student_id = users.id
  )
);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify policies exist
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

