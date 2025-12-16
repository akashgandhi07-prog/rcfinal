-- ============================================
-- REGENT'S PRIVATE CLIENT PORTAL DATABASE SCHEMA (FIXED)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'student', 'parent');

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
  approval_status approval_status NOT NULL DEFAULT 'approved',
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_status ON public.users(onboarding_status);

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
  vr_score INTEGER CHECK (vr_score >= 300 AND vr_score <= 900),
  dm_score INTEGER CHECK (dm_score >= 300 AND dm_score <= 900),
  qr_score INTEGER CHECK (qr_score >= 300 AND qr_score <= 900),
  ar_score INTEGER CHECK (ar_score >= 300 AND ar_score <= 900),
  total_score INTEGER CHECK (total_score >= 1200 AND total_score <= 3600),
  sjt_band TEXT CHECK (sjt_band IN ('Band 1', 'Band 2', 'Band 3', 'Band 4')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ucat_mocks_user ON public.ucat_mocks(user_id);
CREATE INDEX IF NOT EXISTS idx_ucat_mocks_date ON public.ucat_mocks(date);

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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ucat_mocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_strategies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view own data" ON public.users;
DROP POLICY IF EXISTS "Students can update own data" ON public.users;
DROP POLICY IF EXISTS "Parents can view linked student data" ON public.users;
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
DROP POLICY IF EXISTS "Parents can view own links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Students can view own links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Admins have full access to links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Users can view own feature toggles" ON public.feature_toggles;
DROP POLICY IF EXISTS "Admins can update feature toggles" ON public.feature_toggles;
DROP POLICY IF EXISTS "Students can manage own UCAT data" ON public.ucat_mocks;
DROP POLICY IF EXISTS "Parents can view linked student UCAT data" ON public.ucat_mocks;
DROP POLICY IF EXISTS "Admins have full access to UCAT data" ON public.ucat_mocks;

-- ============================================
-- USERS TABLE POLICIES (FIXED)
-- ============================================

-- Students can view their own data
CREATE POLICY "Students can view own data"
  ON public.users FOR SELECT
  USING (
    auth.uid()::text = id::text 
    AND EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'student')
  );

-- Students can update their own data
CREATE POLICY "Students can update own data"
  ON public.users FOR UPDATE
  USING (
    auth.uid()::text = id::text 
    AND EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'student')
  );

-- Parents can view data of linked students
CREATE POLICY "Parents can view linked student data"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.users u ON u.id::text = auth.uid()::text
      WHERE psl.parent_id = u.id
      AND psl.student_id = users.id
      AND u.role = 'parent'
    )
  );

-- Parents can view their own data
CREATE POLICY "Parents can view own data"
  ON public.users FOR SELECT
  USING (
    auth.uid()::text = id::text 
    AND EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'parent')
  );

-- Admins can do everything
CREATE POLICY "Admins have full access"
  ON public.users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- PARENT-STUDENT LINKS POLICIES (FIXED)
-- ============================================

-- Parents can view their own links
CREATE POLICY "Parents can view own links"
  ON public.parent_student_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text 
      AND role = 'parent'
      AND id = parent_student_links.parent_id
    )
  );

-- Students can view links where they are the student
CREATE POLICY "Students can view own links"
  ON public.parent_student_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text 
      AND role = 'student'
      AND id = parent_student_links.student_id
    )
  );

-- Admins can create/delete links
CREATE POLICY "Admins can manage links"
  ON public.parent_student_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- FEATURE TOGGLES POLICIES (FIXED)
-- ============================================

-- Users can view their own feature toggles
CREATE POLICY "Users can view own feature toggles"
  ON public.feature_toggles FOR SELECT
  USING (
    user_id::text = auth.uid()::text
  );

-- Only admins can update feature toggles
CREATE POLICY "Admins can update feature toggles"
  ON public.feature_toggles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- UCAT MOCKS POLICIES (FIXED)
-- ============================================

-- Students can view and manage their own UCAT data
CREATE POLICY "Students can manage own UCAT data"
  ON public.ucat_mocks FOR ALL
  USING (
    user_id::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'student'
    )
  );

-- Parents can view UCAT data of linked students
CREATE POLICY "Parents can view linked student UCAT data"
  ON public.ucat_mocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.users u ON u.id::text = auth.uid()::text
      WHERE psl.parent_id = u.id
      AND psl.student_id = ucat_mocks.user_id
      AND u.role = 'parent'
    )
  );

-- Admins can do everything
CREATE POLICY "Admins have full access to UCAT data"
  ON public.ucat_mocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- PORTFOLIO ACTIVITIES POLICIES
-- ============================================

-- Students can manage their own portfolio
CREATE POLICY "Students can manage own portfolio"
  ON public.portfolio_activities FOR ALL
  USING (
    user_id::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'student'
    )
  );

-- Parents can view portfolio of linked students
CREATE POLICY "Parents can view linked student portfolio"
  ON public.portfolio_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.users u ON u.id::text = auth.uid()::text
      WHERE psl.parent_id = u.id
      AND psl.student_id = portfolio_activities.user_id
      AND u.role = 'parent'
    )
  );

-- Admins can do everything
CREATE POLICY "Admins have full access to portfolio"
  ON public.portfolio_activities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- UNIVERSITY STRATEGIES POLICIES
-- ============================================

-- Students can manage their own university strategy
CREATE POLICY "Students can manage own university strategy"
  ON public.university_strategies FOR ALL
  USING (
    user_id::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'student'
    )
  );

-- Parents can view university strategy of linked students
CREATE POLICY "Parents can view linked student university strategy"
  ON public.university_strategies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.users u ON u.id::text = auth.uid()::text
      WHERE psl.parent_id = u.id
      AND psl.student_id = university_strategies.user_id
      AND u.role = 'parent'
    )
  );

-- Admins can do everything
CREATE POLICY "Admins have full access to university strategy"
  ON public.university_strategies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

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
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for feature_toggles table
DROP TRIGGER IF EXISTS update_feature_toggles_updated_at ON public.feature_toggles;
CREATE TRIGGER update_feature_toggles_updated_at
  BEFORE UPDATE ON public.feature_toggles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ucat_mocks table
DROP TRIGGER IF EXISTS update_ucat_mocks_updated_at ON public.ucat_mocks;
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


