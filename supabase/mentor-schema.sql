-- ============================================
-- MENTOR FUNCTIONALITY SCHEMA
-- ============================================
-- Run this after the main schema-fixed.sql

-- Add 'mentor' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'mentor';

-- ============================================
-- MENTOR-STUDENT LINKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.mentor_student_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mentor_id, student_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mentor_student_links_mentor ON public.mentor_student_links(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_links_student ON public.mentor_student_links(student_id);

-- ============================================
-- MENTOR COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.mentor_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL, -- 'dashboard', 'profile', 'portfolio', 'ucat', 'strategy', 'interview', 'work_experience', 'volunteering', 'supracurricular', etc.
  section_item_id TEXT, -- Optional: ID of specific item (e.g., portfolio activity ID, UCAT mock ID)
  comment_text TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'feedback', -- 'feedback', 'plan', 'suggestion'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mentor_comments_student ON public.mentor_comments(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_comments_mentor ON public.mentor_comments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_comments_section ON public.mentor_comments(section);
CREATE INDEX IF NOT EXISTS idx_mentor_comments_created ON public.mentor_comments(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE public.mentor_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Mentors can view own links" ON public.mentor_student_links;
DROP POLICY IF EXISTS "Students can view own links" ON public.mentor_student_links;
DROP POLICY IF EXISTS "Parents can view linked student mentor links" ON public.mentor_student_links;
DROP POLICY IF EXISTS "Admins have full access to mentor links" ON public.mentor_student_links;

DROP POLICY IF EXISTS "Mentors can manage own comments" ON public.mentor_comments;
DROP POLICY IF EXISTS "Students can view own comments" ON public.mentor_comments;
DROP POLICY IF EXISTS "Parents can view linked student comments" ON public.mentor_comments;
DROP POLICY IF EXISTS "Admins have full access to comments" ON public.mentor_comments;

-- Mentor-Student Links Policies
CREATE POLICY "Mentors can view own links"
  ON public.mentor_student_links FOR SELECT
  USING (
    mentor_id::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'mentor'
    )
  );

CREATE POLICY "Students can view own links"
  ON public.mentor_student_links FOR SELECT
  USING (
    student_id::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'student'
    )
  );

CREATE POLICY "Parents can view linked student mentor links"
  ON public.mentor_student_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.users u ON u.id::text = auth.uid()::text
      WHERE psl.parent_id = u.id
      AND psl.student_id = mentor_student_links.student_id
      AND u.role = 'parent'
    )
  );

CREATE POLICY "Admins have full access to mentor links"
  ON public.mentor_student_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Mentor Comments Policies
CREATE POLICY "Mentors can manage own comments"
  ON public.mentor_comments FOR ALL
  USING (
    mentor_id::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'mentor'
    )
  );

CREATE POLICY "Students can view own comments"
  ON public.mentor_comments FOR SELECT
  USING (
    student_id::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'student'
    )
  );

CREATE POLICY "Parents can view linked student comments"
  ON public.mentor_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.users u ON u.id::text = auth.uid()::text
      WHERE psl.parent_id = u.id
      AND psl.student_id = mentor_comments.student_id
      AND u.role = 'parent'
    )
  );

CREATE POLICY "Admins have full access to comments"
  ON public.mentor_comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_mentor_comments_updated_at ON public.mentor_comments;
CREATE TRIGGER update_mentor_comments_updated_at
  BEFORE UPDATE ON public.mentor_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


