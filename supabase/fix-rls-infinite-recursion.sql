-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- Run this in Supabase SQL Editor
-- ============================================
-- This fixes the infinite recursion issue where policies query the users table
-- to check admin status, which triggers the same policy again.

-- ============================================
-- STEP 1: Create security definer function to check admin role
-- This function bypasses RLS to check user role
-- ============================================
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================
-- STEP 2: Drop ALL existing problematic policies
-- This includes policies that query users table directly
-- ============================================

-- Drop all admin policies that might cause recursion
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Admins have full access to parent links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Admins have full access to mentor links" ON public.mentor_student_links;
DROP POLICY IF EXISTS "Admins have full access to UCAT data" ON public.ucat_mocks;
DROP POLICY IF EXISTS "Admins have full access to portfolio" ON public.portfolio_activities;
DROP POLICY IF EXISTS "Admins have full access to mentor comments" ON public.mentor_comments;
DROP POLICY IF EXISTS "Admins have full access to university strategies" ON public.university_strategies;
DROP POLICY IF EXISTS "Admins have full access to feature toggles" ON public.feature_toggles;
DROP POLICY IF EXISTS "Admins can update feature toggles" ON public.feature_toggles;
DROP POLICY IF EXISTS "Admins have full access to activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Admins have full access to links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Admins can manage links" ON public.parent_student_links;

-- ============================================
-- STEP 3: Ensure basic user policies exist first
-- Users must be able to view their own data
-- ============================================

-- Drop and recreate basic user policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Students can view own data" ON public.users;
DROP POLICY IF EXISTS "Students can update own data" ON public.users;

-- Basic policy: Users can ALWAYS view their own data (no role check needed)
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can insert their own profile during signup
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- STEP 4: Recreate admin policies using the function
-- ============================================

-- Users table - Admins can do everything
CREATE POLICY "Admins have full access to users"
  ON public.users FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Parent-Student Links - Admins can do everything
CREATE POLICY "Admins have full access to parent links"
  ON public.parent_student_links FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Mentor-Student Links - Admins can do everything
CREATE POLICY "Admins have full access to mentor links"
  ON public.mentor_student_links FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- UCAT Mocks - Admins can do everything
CREATE POLICY "Admins have full access to UCAT data"
  ON public.ucat_mocks FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Portfolio Activities - Admins can do everything
CREATE POLICY "Admins have full access to portfolio"
  ON public.portfolio_activities FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- University Strategies - Admins can do everything
CREATE POLICY "Admins have full access to university strategies"
  ON public.university_strategies FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Mentor Comments - Admins can do everything
CREATE POLICY "Admins have full access to mentor comments"
  ON public.mentor_comments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Feature Toggles - Admins can do everything
CREATE POLICY "Admins have full access to feature toggles"
  ON public.feature_toggles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Activity Log - Admins can do everything
CREATE POLICY "Admins have full access to activity log"
  ON public.activity_log FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Audit Log - Admins can view (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_log') THEN
    DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
    CREATE POLICY "Admins can view audit logs"
      ON public.audit_log FOR SELECT
      USING (public.is_admin());
  END IF;
END $$;

-- Login Attempts - Admins can view (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'login_attempts') THEN
    DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;
    CREATE POLICY "Admins can view login attempts"
      ON public.login_attempts FOR SELECT
      USING (public.is_admin());
  END IF;
END $$;

-- ============================================
-- STEP 5: Verify the fix
-- ============================================
-- Check that policies exist and use the function
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%is_admin%' THEN 'Uses is_admin() function'
    ELSE 'Does not use is_admin()'
  END as uses_function
FROM pg_policies
WHERE policyname LIKE '%Admin%'
ORDER BY tablename, policyname;

-- Test the function (should return true for admins, false for others)
-- SELECT public.is_admin() as current_user_is_admin;

