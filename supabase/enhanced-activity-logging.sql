-- ============================================
-- ENHANCED ACTIVITY LOGGING FOR ADMIN VIEW
-- Run this in Supabase SQL Editor
-- ============================================

-- Create comprehensive activity log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action_type TEXT NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', 'view', etc.
  resource_type TEXT NOT NULL, -- 'user', 'ucat_mock', 'portfolio_activity', 'university_strategy', etc.
  resource_id UUID,
  description TEXT,
  metadata JSONB, -- Additional context (IP, user agent, changes made, etc.)
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
-- NOTE: This policy should use is_admin() function to avoid RLS recursion
-- See fix-rls-infinite-recursion.sql for the proper implementation
CREATE POLICY "Admins can view activity logs"
  ON public.activity_log FOR SELECT
  USING (public.is_admin());

-- Allow all authenticated users to insert their own activity logs
CREATE POLICY "Users can log their own activities"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_email ON public.activity_log(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_log_action_type ON public.activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource_type ON public.activity_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created ON public.activity_log(user_id, created_at DESC);

-- Function to log activity (can be called from client)
-- NOTE: This version uses auth.users to avoid RLS recursion issues
-- If you need to update this function, use fix-log-activity-rpc.sql
CREATE OR REPLACE FUNCTION log_activity(
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_log_id UUID;
BEGIN
  -- Get current user from auth (doesn't trigger RLS)
  v_user_id := auth.uid();
  
  -- Get user email from auth.users metadata (doesn't trigger RLS on public.users)
  -- This avoids the infinite recursion issue
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;
  
  -- If email not found in auth.users, try to get from public.users as fallback
  IF v_user_email IS NULL THEN
    SELECT email INTO v_user_email
    FROM public.users
    WHERE id = v_user_id
    LIMIT 1;
  END IF;
  
  -- Insert activity log
  INSERT INTO public.activity_log (
    user_id,
    user_email,
    action_type,
    resource_type,
    resource_id,
    description,
    metadata
  ) VALUES (
    v_user_id,
    v_user_email,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_description,
    p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Silently fail - logging should never break the app
    RETURN NULL;
END;
$$;

-- Add triggers for UCAT mocks
DROP TRIGGER IF EXISTS audit_ucat_mocks_trigger ON public.ucat_mocks;
CREATE TRIGGER audit_ucat_mocks_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ucat_mocks
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_operation();

-- Add triggers for portfolio activities
DROP TRIGGER IF EXISTS audit_portfolio_activities_trigger ON public.portfolio_activities;
CREATE TRIGGER audit_portfolio_activities_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.portfolio_activities
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_operation();

-- Add triggers for university strategies
DROP TRIGGER IF EXISTS audit_university_strategies_trigger ON public.university_strategies;
CREATE TRIGGER audit_university_strategies_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.university_strategies
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_operation();

-- Add triggers for mentor comments
DROP TRIGGER IF EXISTS audit_mentor_comments_trigger ON public.mentor_comments;
CREATE TRIGGER audit_mentor_comments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.mentor_comments
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_operation();

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  user_email TEXT,
  total_activities BIGINT,
  last_activity TIMESTAMPTZ,
  login_count BIGINT,
  last_login TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.user_email,
    COUNT(*)::BIGINT as total_activities,
    MAX(al.created_at) as last_activity,
    COUNT(*) FILTER (WHERE al.action_type = 'login')::BIGINT as login_count,
    MAX(al.created_at) FILTER (WHERE al.action_type = 'login') as last_login
  FROM public.activity_log al
  WHERE (p_user_id IS NULL OR al.user_id = p_user_id)
  GROUP BY al.user_email
  ORDER BY last_activity DESC;
END;
$$;

