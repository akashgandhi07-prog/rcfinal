-- ============================================
-- COMPREHENSIVE SECURITY HARDENING
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ENSURE ADMIN RLS POLICIES ARE COMPREHENSIVE
-- ============================================

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Admins have full access to UCAT data" ON public.ucat_mocks;
DROP POLICY IF EXISTS "Admins have full access to portfolio" ON public.portfolio_activities;
DROP POLICY IF EXISTS "Admins can manage links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Admins have full access to mentor links" ON public.mentor_student_links;
DROP POLICY IF EXISTS "Admins have full access to mentor comments" ON public.mentor_comments;

-- Users table - Admins can do everything
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

-- Parent-Student Links - Admins can do everything
CREATE POLICY "Admins have full access to parent links"
  ON public.parent_student_links FOR ALL
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

-- Mentor-Student Links - Admins can do everything
CREATE POLICY "Admins have full access to mentor links"
  ON public.mentor_student_links FOR ALL
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

-- Mentor Comments - Admins can do everything
CREATE POLICY "Admins have full access to mentor comments"
  ON public.mentor_comments FOR ALL
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

-- UCAT Mocks - Admins can do everything
CREATE POLICY "Admins have full access to UCAT data"
  ON public.ucat_mocks FOR ALL
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

-- Portfolio Activities - Admins can do everything
CREATE POLICY "Admins have full access to portfolio"
  ON public.portfolio_activities FOR ALL
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

-- University Strategies - Admins can do everything
CREATE POLICY "Admins have full access to university strategies"
  ON public.university_strategies FOR ALL
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
-- 2. SECURITY: PREVENT ROLE ESCALATION
-- ============================================

-- Function to prevent users from changing their own role to admin
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is trying to change their own role to admin, prevent it
  IF NEW.id::text = auth.uid()::text AND NEW.role = 'admin' AND OLD.role != 'admin' THEN
    RAISE EXCEPTION 'Users cannot change their own role to admin';
  END IF;
  
  -- If user is trying to change someone else's role, only allow if they are admin
  IF NEW.id::text != auth.uid()::text AND NEW.role != OLD.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.users;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_escalation();

-- ============================================
-- 3. SECURITY: ENSURE ADMINS ARE ALWAYS APPROVED
-- ============================================

-- Function to auto-approve admins
CREATE OR REPLACE FUNCTION auto_approve_admins()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is admin, automatically set approval_status to approved
  IF NEW.role = 'admin' THEN
    NEW.approval_status := 'approved';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS auto_approve_admins_trigger ON public.users;
CREATE TRIGGER auto_approve_admins_trigger
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_admins();

-- ============================================
-- 4. SECURITY: AUDIT LOG FOR SENSITIVE OPERATIONS
-- ============================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Function to log sensitive operations
CREATE OR REPLACE FUNCTION log_sensitive_operation()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Log the operation
  INSERT INTO public.audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    current_user_id,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
DROP TRIGGER IF EXISTS audit_users_trigger ON public.users;
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_operation();

DROP TRIGGER IF EXISTS audit_parent_links_trigger ON public.parent_student_links;
CREATE TRIGGER audit_parent_links_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.parent_student_links
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_operation();

DROP TRIGGER IF EXISTS audit_mentor_links_trigger ON public.mentor_student_links;
CREATE TRIGGER audit_mentor_links_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.mentor_student_links
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_operation();

-- ============================================
-- 5. SECURITY: RATE LIMITING FOR LOGIN ATTEMPTS
-- ============================================

-- Create login attempts table
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "Admins can view login attempts"
  ON public.login_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created ON public.login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created ON public.login_attempts(ip_address, created_at DESC);

-- Function to check if account should be locked
CREATE OR REPLACE FUNCTION should_lock_account(email_address TEXT, ip_addr TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  failed_attempts INTEGER;
  lockout_threshold INTEGER := 5;
  lockout_window INTERVAL := '15 minutes';
BEGIN
  -- Count failed attempts in the last lockout window
  SELECT COUNT(*) INTO failed_attempts
  FROM public.login_attempts
  WHERE email = email_address
    AND success = FALSE
    AND created_at > NOW() - lockout_window;
  
  RETURN failed_attempts >= lockout_threshold;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. SECURITY: PASSWORD STRENGTH VALIDATION
-- ============================================

-- Note: Password validation is handled client-side and by Supabase Auth
-- This is just a reminder that passwords should be:
-- - Minimum 8 characters (Supabase default is 6, but we recommend 8)
-- - Include uppercase, lowercase, numbers, and special characters
-- - Not be a common password

-- ============================================
-- 7. SECURITY: ENSURE ALL TABLES HAVE RLS ENABLED
-- ============================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- ============================================
-- 8. SECURITY: PREVENT SQL INJECTION
-- ============================================

-- All queries should use parameterized queries (already done in queries.ts)
-- This is a reminder to always use Supabase client methods, never raw SQL with user input

-- ============================================
-- 9. SECURITY: SESSION MANAGEMENT
-- ============================================

-- Supabase handles session management automatically
-- Sessions expire after 1 hour of inactivity by default
-- This can be configured in Supabase Dashboard > Authentication > Settings

-- ============================================
-- 10. SECURITY: CORS AND API SECURITY
-- ============================================

-- CORS is handled by Next.js middleware
-- API routes should validate authentication
-- Never expose service role key in client-side code

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check that all admin policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname LIKE '%admin%'
ORDER BY tablename, policyname;

-- Check that RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- NOTES
-- ============================================

-- 1. Always use parameterized queries (Supabase client handles this)
-- 2. Never expose service role key in client-side code
-- 3. Regularly review audit logs for suspicious activity
-- 4. Monitor login attempts for brute force attacks
-- 5. Keep Supabase and Next.js dependencies updated
-- 6. Use HTTPS in production (handled by hosting provider)
-- 7. Enable 2FA for admin accounts (configure in Supabase Dashboard)
-- 8. Regularly backup database
-- 9. Review and update RLS policies as needed
-- 10. Test security measures regularly

