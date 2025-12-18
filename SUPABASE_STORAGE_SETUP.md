# Supabase Storage Setup for Document Management

## Overview
The document management system requires Supabase Storage to be configured with a bucket and proper RLS policies.

## Step-by-Step Setup

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Enter bucket name: `student-documents`
5. Set **Public bucket**: `No` (Private bucket)
6. Click **"Create bucket"**

### 2. Set Up Storage Policies

Go to **Storage > Policies** and select the `student-documents` bucket, then create these policies:

#### Policy 1: Users can upload own documents
```sql
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Users can read accessible documents
```sql
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
```

#### Policy 3: Users can delete their own uploads
```sql
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
```

#### Policy 4: Users can update their own uploads
```sql
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
```

### 3. Run Database Schema

Run the SQL from `supabase/document-management-schema.sql` in your Supabase SQL Editor to create the `student_documents` table and its RLS policies.

### 4. Verify Setup

1. Test file upload as a student
2. Test file access as a parent viewing linked student
3. Test file access as a mentor viewing linked student
4. Test admin access to all files

## File Structure

Files are stored in the following structure:
```
student-documents/
  {user_id}/
    personal_statement/
      {timestamp}-{filename}
    cv/
      {timestamp}-{filename}
    grades/
      {timestamp}-{filename}
    other/
      {timestamp}-{filename}
```

## Notes

- Maximum file size: 10MB (enforced client-side)
- Allowed file types: PDF, DOC, DOCX, images (JPEG, PNG), TXT
- Files are accessed via signed URLs (temporary access)
- RLS policies ensure users can only access files they have permission to view

