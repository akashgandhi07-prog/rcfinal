-- ============================================
-- RESOURCE LIBRARY SCHEMA
-- ============================================

-- Resource types enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type') THEN
    CREATE TYPE resource_type AS ENUM ('knowledge_base', 'video_library', 'template_library', 'university_guides');
  END IF;
END
$$;

-- Resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type resource_type NOT NULL,
  file_url TEXT, -- Supabase Storage URL
  file_name TEXT,
  file_size INTEGER, -- in bytes
  file_type TEXT, -- MIME type
  external_url TEXT, -- For external links (e.g., YouTube videos)
  thumbnail_url TEXT, -- For video thumbnails
  visible_to_medicine BOOLEAN DEFAULT false,
  visible_to_dentistry BOOLEAN DEFAULT false,
  visible_to_veterinary BOOLEAN DEFAULT false,
  tags TEXT[], -- Array of tags for searchability
  searchable_content TEXT, -- Full-text search content
  university_name TEXT, -- For university guides
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_medicine ON public.resources(visible_to_medicine) WHERE visible_to_medicine = true;
CREATE INDEX IF NOT EXISTS idx_resources_dentistry ON public.resources(visible_to_dentistry) WHERE visible_to_dentistry = true;
CREATE INDEX IF NOT EXISTS idx_resources_veterinary ON public.resources(visible_to_veterinary) WHERE visible_to_veterinary = true;
CREATE INDEX IF NOT EXISTS idx_resources_active ON public.resources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_resources_tags ON public.resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_resources_search ON public.resources USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(searchable_content, '')));

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resources

-- Students can view resources visible to their course
CREATE POLICY "Students can view resources for their course"
  ON public.resources FOR SELECT
  USING (
    is_active = true AND (
      -- Check if resource is visible to student's course
      (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE auth.uid()::text = id::text
          AND role = 'student'
          AND (
            (target_course = 'medicine' AND visible_to_medicine = true) OR
            (target_course = 'dentistry' AND visible_to_dentistry = true) OR
            (target_course = 'veterinary' AND visible_to_veterinary = true)
          )
        )
      )
    )
  );

-- Parents can view resources visible to their linked students' courses
CREATE POLICY "Parents can view resources for linked students"
  ON public.resources FOR SELECT
  USING (
    is_active = true AND (
      EXISTS (
        SELECT 1 FROM public.parent_student_links psl
        JOIN public.users u ON u.id = psl.student_id
        WHERE psl.parent_id = (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
        AND (
          (u.target_course = 'medicine' AND visible_to_medicine = true) OR
          (u.target_course = 'dentistry' AND visible_to_dentistry = true) OR
          (u.target_course = 'veterinary' AND visible_to_veterinary = true)
        )
      )
    )
  );

-- Mentors can view resources visible to their linked students' courses
CREATE POLICY "Mentors can view resources for linked students"
  ON public.resources FOR SELECT
  USING (
    is_active = true AND (
      EXISTS (
        SELECT 1 FROM public.mentor_student_links msl
        JOIN public.users u ON u.id = msl.student_id
        WHERE msl.mentor_id = (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
        AND (
          (u.target_course = 'medicine' AND visible_to_medicine = true) OR
          (u.target_course = 'dentistry' AND visible_to_dentistry = true) OR
          (u.target_course = 'veterinary' AND visible_to_veterinary = true)
        )
      )
    )
  );

-- Admins have full access
CREATE POLICY "Admins have full access to resources"
  ON public.resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth.uid()::text = id::text AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for resources (run this in Supabase dashboard or via API)
-- The bucket should be created with public read access for authenticated users
-- Bucket name: 'resources'

