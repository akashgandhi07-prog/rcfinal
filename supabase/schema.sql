-- ============================================
-- REGENT'S PRIVATE CLIENT PORTAL DATABASE SCHEMA
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

-- ============================================
-- USERS TABLE (Profile)
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT,
  target_course target_course,
  onboarding_status onboarding_status NOT NULL DEFAULT 'pending',
  date_of_birth DATE,
  home_address TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ucat_mocks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Students can view and update their own data
CREATE POLICY "Students can view own data"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id::text OR role = 'student' AND auth.uid()::text = id::text);

CREATE POLICY "Students can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id::text AND role = 'student');

-- Parents can view data of linked students
CREATE POLICY "Parents can view linked student data"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
      AND student_id = users.id
    )
  );

-- Admins can do everything
CREATE POLICY "Admins have full access"
  ON public.users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth.uid()::text = id::text AND role = 'admin'
    )
  );

-- ============================================
-- PARENT-STUDENT LINKS POLICIES
-- ============================================

-- Parents can view their own links
CREATE POLICY "Parents can view own links"
  ON public.parent_student_links FOR SELECT
  USING (parent_id = (SELECT id FROM public.users WHERE auth.uid()::text = id::text));

-- Students can view links where they are the student
CREATE POLICY "Students can view own links"
  ON public.parent_student_links FOR SELECT
  USING (student_id = (SELECT id FROM public.users WHERE auth.uid()::text = id::text));

-- Admins can do everything
CREATE POLICY "Admins have full access to links"
  ON public.parent_student_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth.uid()::text = id::text AND role = 'admin'
    )
  );

-- ============================================
-- FEATURE TOGGLES POLICIES
-- ============================================

-- Users can view their own feature toggles
CREATE POLICY "Users can view own feature toggles"
  ON public.feature_toggles FOR SELECT
  USING (user_id = (SELECT id FROM public.users WHERE auth.uid()::text = id::text));

-- Only admins can update feature toggles
CREATE POLICY "Admins can update feature toggles"
  ON public.feature_toggles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth.uid()::text = id::text AND role = 'admin'
    )
  );

-- ============================================
-- UCAT MOCKS POLICIES
-- ============================================

-- Students can view and manage their own UCAT data
CREATE POLICY "Students can manage own UCAT data"
  ON public.ucat_mocks FOR ALL
  USING (
    user_id = (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
    AND EXISTS (SELECT 1 FROM public.users WHERE auth.uid()::text = id::text AND role = 'student')
  );

-- Parents can view UCAT data of linked students
CREATE POLICY "Parents can view linked student UCAT data"
  ON public.ucat_mocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
      AND student_id = ucat_mocks.user_id
    )
  );

-- Admins can do everything
CREATE POLICY "Admins have full access to UCAT data"
  ON public.ucat_mocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth.uid()::text = id::text AND role = 'admin'
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

