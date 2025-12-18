-- ============================================
-- REGENT'S PRIVATE CLIENT PORTAL DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'student', 'parent', 'mentor');

-- Target courses
CREATE TYPE target_course AS ENUM ('medicine', 'dentistry', 'veterinary');

-- Onboarding status
CREATE TYPE onboarding_status AS ENUM ('pending', 'complete');

-- Account approval status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END
$$;

-- ============================================
-- USERS TABLE (Profile)
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT,
  target_course target_course,
  onboarding_status onboarding_status NOT NULL DEFAULT 'pending',
  approval_status approval_status NOT NULL DEFAULT 'pending',
  date_of_birth DATE,
  home_address TEXT,
  contact_number TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  parent2_name TEXT,
  parent2_phone TEXT,
  parent2_email TEXT,
  school_name TEXT,
  gcse_summary TEXT,
  a_level_predictions TEXT,
  consultant_assigned TEXT,
  contract_status TEXT DEFAULT 'Active',
  client_id TEXT,
  entry_year INTEGER,
  country TEXT,
  fee_status TEXT CHECK (fee_status IN ('home', 'international', 'unsure')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_status ON public.users(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON public.users(approval_status);

-- ============================================
-- PARENT-STUDENT LINKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_parent_student_links_parent ON public.parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_links_student ON public.parent_student_links(student_id);

-- ============================================
-- FEATURE TOGGLES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.feature_toggles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_name)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_toggles_user ON public.feature_toggles(user_id);

-- ============================================
-- UCAT TRACKER DATA TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.ucat_mocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mock_name TEXT NOT NULL,
  vr_score INTEGER,
  dm_score INTEGER,
  qr_score INTEGER,
  ar_score INTEGER,
  total_score INTEGER,
  sjt_band TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ucat_mocks_user ON public.ucat_mocks(user_id);

-- ============================================
-- PORTFOLIO ACTIVITIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.portfolio_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('work', 'volunteering', 'reading', 'extracurricular')),
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_activities_user ON public.portfolio_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_activities_category ON public.portfolio_activities(category);

-- ============================================
-- UNIVERSITY STRATEGY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.university_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  university_id TEXT NOT NULL,
  university_name TEXT NOT NULL,
  course_code TEXT NOT NULL,
  entrance_req TEXT,
  status TEXT NOT NULL CHECK (status IN ('shortlist', 'applied')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, university_id, status)
);

CREATE INDEX IF NOT EXISTS idx_university_strategies_user ON public.university_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_university_strategies_status ON public.university_strategies(status);

-- ============================================
-- SECURITY DEFINER FUNCTION FOR ADMIN CHECK
-- This prevents infinite recursion in RLS policies
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ucat_mocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_strategies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Students can view own data" ON public.users;
DROP POLICY IF EXISTS "Students can update own data" ON public.users;
DROP POLICY IF EXISTS "Parents can view linked student data" ON public.users;
DROP POLICY IF EXISTS "Parents can view own data" ON public.users;
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;

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

-- Parents can view data of linked students
CREATE POLICY "Parents can view linked student data"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = auth.uid()
      AND student_id = users.id
    )
  );

-- Admins can do everything (using function to prevent recursion)
CREATE POLICY "Admins have full access to users"
  ON public.users FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- PARENT-STUDENT LINKS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Parents can view own links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Students can view own links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Admins have full access to links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Admins have full access to parent links" ON public.parent_student_links;

-- Parents can view their own links
CREATE POLICY "Parents can view own links"
  ON public.parent_student_links FOR SELECT
  USING (parent_id = auth.uid());

-- Students can view links where they are the student
CREATE POLICY "Students can view own links"
  ON public.parent_student_links FOR SELECT
  USING (student_id = auth.uid());

-- Admins can do everything (using function to prevent recursion)
CREATE POLICY "Admins have full access to parent links"
  ON public.parent_student_links FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- FEATURE TOGGLES POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own feature toggles" ON public.feature_toggles;
DROP POLICY IF EXISTS "Admins can update feature toggles" ON public.feature_toggles;
DROP POLICY IF EXISTS "Admins have full access to feature toggles" ON public.feature_toggles;

-- Users can view their own feature toggles
CREATE POLICY "Users can view own feature toggles"
  ON public.feature_toggles FOR SELECT
  USING (user_id = auth.uid());

-- Admins can do everything (using function to prevent recursion)
CREATE POLICY "Admins have full access to feature toggles"
  ON public.feature_toggles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- UCAT MOCKS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Students can manage own UCAT data" ON public.ucat_mocks;
DROP POLICY IF EXISTS "Parents can view linked student UCAT data" ON public.ucat_mocks;
DROP POLICY IF EXISTS "Admins have full access to UCAT data" ON public.ucat_mocks;

-- Students can view and manage their own UCAT data
CREATE POLICY "Students can manage own UCAT data"
  ON public.ucat_mocks FOR ALL
  USING (user_id = auth.uid());

-- Parents can view UCAT data of linked students
CREATE POLICY "Parents can view linked student UCAT data"
  ON public.ucat_mocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = auth.uid()
      AND student_id = ucat_mocks.user_id
    )
  );

-- Admins can do everything (using function to prevent recursion)
CREATE POLICY "Admins have full access to UCAT data"
  ON public.ucat_mocks FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for feature_toggles table
CREATE TRIGGER update_feature_toggles_updated_at
  BEFORE UPDATE ON public.feature_toggles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ucat_mocks table
CREATE TRIGGER update_ucat_mocks_updated_at
  BEFORE UPDATE ON public.ucat_mocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for portfolio_activities table
DROP TRIGGER IF EXISTS update_portfolio_activities_updated_at ON public.portfolio_activities;
CREATE TRIGGER update_portfolio_activities_updated_at
  BEFORE UPDATE ON public.portfolio_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for university_strategies table
DROP TRIGGER IF EXISTS update_university_strategies_updated_at ON public.university_strategies;
CREATE TRIGGER update_university_strategies_updated_at
  BEFORE UPDATE ON public.university_strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PORTFOLIO ACTIVITIES POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Students can manage own portfolio" ON public.portfolio_activities;
DROP POLICY IF EXISTS "Parents can view linked student portfolio" ON public.portfolio_activities;
DROP POLICY IF EXISTS "Admins have full access to portfolio" ON public.portfolio_activities;

-- Students can manage their own portfolio
CREATE POLICY "Students can manage own portfolio"
  ON public.portfolio_activities FOR ALL
  USING (user_id = auth.uid());

-- Parents can view portfolio of linked students
CREATE POLICY "Parents can view linked student portfolio"
  ON public.portfolio_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = auth.uid()
      AND student_id = portfolio_activities.user_id
    )
  );

-- Admins can do everything (using function to prevent recursion)
CREATE POLICY "Admins have full access to portfolio"
  ON public.portfolio_activities FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- UNIVERSITY STRATEGIES POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Students can manage own university strategy" ON public.university_strategies;
DROP POLICY IF EXISTS "Parents can view linked student university strategy" ON public.university_strategies;
DROP POLICY IF EXISTS "Admins have full access to university strategies" ON public.university_strategies;

-- Students can manage their own university strategy
CREATE POLICY "Students can manage own university strategy"
  ON public.university_strategies FOR ALL
  USING (user_id = auth.uid());

-- Parents can view university strategy of linked students
CREATE POLICY "Parents can view linked student university strategy"
  ON public.university_strategies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = auth.uid()
      AND student_id = university_strategies.user_id
    )
  );

-- Admins can do everything (using function to prevent recursion)
CREATE POLICY "Admins have full access to university strategies"
  ON public.university_strategies FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

