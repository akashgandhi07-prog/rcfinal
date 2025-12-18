-- ============================================
-- DOCUMENT MANAGEMENT SYSTEM SCHEMA
-- ============================================
-- Run this after the main schema.sql

-- ============================================
-- STUDENT DOCUMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('personal_statement', 'cv', 'grades', 'other')),
  title TEXT NOT NULL, -- For "other" category, this is user-defined
  description TEXT, -- Optional description/comment
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  version INTEGER DEFAULT 1, -- For version tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_documents_user ON public.student_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_category ON public.student_documents(category);
CREATE INDEX IF NOT EXISTS idx_student_documents_uploaded_by ON public.student_documents(uploaded_by);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_student_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_documents_timestamp
  BEFORE UPDATE ON public.student_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_student_documents_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Students can view/upload/delete their own documents
CREATE POLICY "Students can view own documents"
  ON public.student_documents
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Students can upload own documents"
  ON public.student_documents
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() = uploaded_by
  );

CREATE POLICY "Students can update own documents"
  ON public.student_documents
  FOR UPDATE
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Students can delete own documents"
  ON public.student_documents
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- Parents can view/upload/update/delete documents for linked students
CREATE POLICY "Parents can view linked student documents"
  ON public.student_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = auth.uid()
      AND student_id = user_id
    )
  );

CREATE POLICY "Parents can upload documents for linked students"
  ON public.student_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = auth.uid()
      AND student_id = user_id
    ) AND
    auth.uid() = uploaded_by
  );

CREATE POLICY "Parents can update documents for linked students"
  ON public.student_documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = auth.uid()
      AND student_id = user_id
    )
  );

CREATE POLICY "Parents can delete documents for linked students"
  ON public.student_documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_id = auth.uid()
      AND student_id = user_id
    )
  );

-- Mentors can view/upload/update/delete documents for linked students
CREATE POLICY "Mentors can view linked student documents"
  ON public.student_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_student_links
      WHERE mentor_id = auth.uid()
      AND student_id = user_id
    )
  );

CREATE POLICY "Mentors can upload documents for linked students"
  ON public.student_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mentor_student_links
      WHERE mentor_id = auth.uid()
      AND student_id = user_id
    ) AND
    auth.uid() = uploaded_by
  );

CREATE POLICY "Mentors can update documents for linked students"
  ON public.student_documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_student_links
      WHERE mentor_id = auth.uid()
      AND student_id = user_id
    )
  );

CREATE POLICY "Mentors can delete documents for linked students"
  ON public.student_documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_student_links
      WHERE mentor_id = auth.uid()
      AND student_id = user_id
    )
  );

-- Admins can do everything
CREATE POLICY "Admins can view all documents"
  ON public.student_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can upload documents"
  ON public.student_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    ) AND
    auth.uid() = uploaded_by
  );

CREATE POLICY "Admins can update all documents"
  ON public.student_documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all documents"
  ON public.student_documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- STORAGE POLICIES (to be run in Supabase Dashboard or via SQL)
-- ============================================

-- Note: These policies need to be set up in Supabase Dashboard under Storage > Policies
-- Or run via Supabase SQL Editor after creating the bucket

-- First, create the bucket (run this in Supabase Dashboard Storage section):
-- Bucket name: student-documents
-- Public: false

-- Storage policies (run after bucket creation):
/*
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read files they have access to
CREATE POLICY "Users can read accessible documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-documents' AND
  (
    -- Own documents
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Linked student documents (parent)
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.users u ON u.id = psl.student_id
      WHERE psl.parent_id = auth.uid()
      AND (storage.foldername(name))[1] = u.id::text
    )
    OR
    -- Linked student documents (mentor)
    EXISTS (
      SELECT 1 FROM public.mentor_student_links msl
      JOIN public.users u ON u.id = msl.student_id
      WHERE msl.mentor_id = auth.uid()
      AND (storage.foldername(name))[1] = u.id::text
    )
    OR
    -- Admin access
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'student-documents' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'student-documents' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
);
*/

