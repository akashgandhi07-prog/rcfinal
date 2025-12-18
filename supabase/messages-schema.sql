-- ============================================
-- MESSAGING SYSTEM SCHEMA
-- ============================================
-- Direct messaging between student/parent/mentor/admin
-- Supports threaded conversations with reply chains

-- ============================================
-- MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID, -- Groups messages in a conversation thread
  parent_id UUID REFERENCES public.messages(id) ON DELETE CASCADE, -- For replies (null for top-level messages)
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- null for group conversations
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- The student context for this conversation
  subject TEXT, -- Optional subject for the thread
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON public.messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_student_id ON public.messages(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);

-- Function to set thread_id to id if thread_id is null (for top-level messages)
CREATE OR REPLACE FUNCTION set_thread_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.thread_id IS NULL THEN
    NEW.thread_id := NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set thread_id
DROP TRIGGER IF EXISTS set_thread_id_trigger ON public.messages;
CREATE TRIGGER set_thread_id_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION set_thread_id();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages they sent" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages they received" ON public.messages;
DROP POLICY IF EXISTS "Students can view messages in their context" ON public.messages;
DROP POLICY IF EXISTS "Parents can view messages for linked students" ON public.messages;
DROP POLICY IF EXISTS "Mentors can view messages for linked students" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON public.messages;

-- Users can view messages they sent
CREATE POLICY "Users can view messages they sent"
  ON public.messages FOR SELECT
  USING (sender_id::text = auth.uid()::text);

-- Users can view messages they received
CREATE POLICY "Users can view messages they received"
  ON public.messages FOR SELECT
  USING (recipient_id::text = auth.uid()::text);

-- Students can view messages in their context (where they are the student_id)
CREATE POLICY "Students can view messages in their context"
  ON public.messages FOR SELECT
  USING (
    student_id::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'student'
    )
  );

-- Parents can view messages for linked students
CREATE POLICY "Parents can view messages for linked students"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.users u ON u.id::text = auth.uid()::text
      WHERE psl.parent_id = u.id
      AND psl.student_id = messages.student_id
      AND u.role = 'parent'
    )
  );

-- Mentors can view messages for linked students
CREATE POLICY "Mentors can view messages for linked students"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_student_links msl
      JOIN public.users u ON u.id::text = auth.uid()::text
      WHERE msl.mentor_id = u.id
      AND msl.student_id = messages.student_id
      AND u.role = 'mentor'
    )
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Users can create messages
CREATE POLICY "Users can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id::text = auth.uid()::text);

-- Users can update their own messages (within a time window, e.g., 5 minutes)
CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (
    sender_id::text = auth.uid()::text
    AND created_at > NOW() - INTERVAL '5 minutes'
  );

-- Users can mark messages as read (recipients can mark their received messages)
CREATE POLICY "Users can mark messages as read"
  ON public.messages FOR UPDATE
  USING (
    recipient_id::text = auth.uid()::text
    OR sender_id::text = auth.uid()::text
  )
  WITH CHECK (
    recipient_id::text = auth.uid()::text
    OR sender_id::text = auth.uid()::text
  );

-- Admins can delete messages
CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

