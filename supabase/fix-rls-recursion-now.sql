-- ============================================
-- QUICK FIX FOR RLS INFINITE RECURSION
-- Run this IMMEDIATELY in Supabase SQL Editor
-- ============================================

-- Step 1: Create the security definer function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = user_id 
    AND role = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Step 2: Drop all problematic policies
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Admins have full access to parent links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Admins can update feature toggles" ON public.feature_toggles;
DROP POLICY IF EXISTS "Admins have full access to feature toggles" ON public.feature_toggles;
DROP POLICY IF EXISTS "Admins have full access to UCAT data" ON public.ucat_mocks;
DROP POLICY IF EXISTS "Admins have full access to portfolio" ON public.portfolio_activities;
DROP POLICY IF EXISTS "Admins have full access to university strategies" ON public.university_strategies;

-- Step 3: Recreate basic user policies (must come first)
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Step 4: Recreate admin policies using the function
CREATE POLICY "Admins have full access to users"
  ON public.users FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to parent links"
  ON public.parent_student_links FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to feature toggles"
  ON public.feature_toggles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to UCAT data"
  ON public.ucat_mocks FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to portfolio"
  ON public.portfolio_activities FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to university strategies"
  ON public.university_strategies FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Step 5: Fix parent-student links policies (remove subquery)
DROP POLICY IF EXISTS "Parents can view own links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Students can view own links" ON public.parent_student_links;

CREATE POLICY "Parents can view own links"
  ON public.parent_student_links FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Students can view own links"
  ON public.parent_student_links FOR SELECT
  USING (student_id = auth.uid());

-- Step 6: Fix feature toggles policy (remove subquery)
DROP POLICY IF EXISTS "Users can view own feature toggles" ON public.feature_toggles;

CREATE POLICY "Users can view own feature toggles"
  ON public.feature_toggles FOR SELECT
  USING (user_id = auth.uid());

-- Step 7: Fix UCAT mocks policies (remove subqueries)
DROP POLICY IF EXISTS "Students can manage own UCAT data" ON public.ucat_mocks;
DROP POLICY IF EXISTS "Parents can view linked student UCAT data" ON public.ucat_mocks;

CREATE POLICY "Students can manage own UCAT data"
  ON public.ucat_mocks FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Parents can view linked student UCAT data"
  ON public.ucat_mocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = auth.uid()
      AND student_id = ucat_mocks.user_id
    )
  );

-- Step 8: Fix parent view linked student data policy (remove subquery)
DROP POLICY IF EXISTS "Parents can view linked student data" ON public.users;

CREATE POLICY "Parents can view linked student data"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = auth.uid()
      AND student_id = users.id
    )
  );

-- Verify the fix worked
SELECT 
  'RLS policies fixed. Test login now.' as status,
  COUNT(*) as admin_policies_using_function
FROM pg_policies
WHERE policyname LIKE '%Admin%'
AND (qual LIKE '%is_admin%' OR with_check LIKE '%is_admin%');

