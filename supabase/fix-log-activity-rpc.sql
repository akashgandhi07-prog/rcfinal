-- ============================================
-- FIX log_activity RPC FUNCTION TO PREVENT RLS RECURSION
-- Run this in Supabase SQL Editor AFTER applying fix-rls-infinite-recursion.sql
-- ============================================
-- The log_activity function queries the users table which can cause infinite recursion
-- This fix uses auth.users() metadata instead of querying public.users

-- Drop and recreate the function to avoid RLS recursion
DROP FUNCTION IF EXISTS public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB);

CREATE OR REPLACE FUNCTION public.log_activity(
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
  -- but only if we can do it safely
  IF v_user_email IS NULL THEN
    -- Use a simple query that won't trigger complex RLS policies
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
    -- Return NULL instead of raising error
    RETURN NULL;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_activity(TEXT, TEXT, UUID, TEXT, JSONB) TO authenticated;

-- Verify the function exists
SELECT 
  proname,
  prosrc
FROM pg_proc
WHERE proname = 'log_activity';

