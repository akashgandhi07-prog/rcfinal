-- ============================================
-- COMPLETE RLS FIX - Run this in Supabase SQL Editor
-- ============================================
-- This fixes all RLS policies to ensure users can access their own data

-- ============================================
-- STEP 1: Create security definer function to check admin role
-- This function bypasses RLS to check user role (prevents infinite recursion)
-- ============================================

-- Drop the function if it exists (to ensure clean recreation)
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_admin();

-- Create the security definer function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Check if the user exists and has admin role
  -- SECURITY DEFINER allows this to bypass RLS
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = user_id 
    AND role = 'admin'
  );
END;
$$;

-- Grant execute permission to authenticated users and anon (for signup)
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ============================================
-- STEP 2: Drop ALL existing policies on users table
-- ============================================
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
-- Uses security definer function to prevent infinite recursion
-- ============================================
CREATE POLICY "Admins have full access to users"
ON public.users FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

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

