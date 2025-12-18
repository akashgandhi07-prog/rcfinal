# Detailed Supabase Storage Setup Guide

## Prerequisites
- Access to your Supabase Dashboard
- Database schema already run (from `supabase/document-management-schema.sql`)

---

## Part 1: Create Storage Bucket

### Step 1: Navigate to Storage
1. Open your Supabase Dashboard
2. Click **"Storage"** in the left sidebar
3. You'll see a list of buckets (or empty if this is your first)

### Step 2: Create New Bucket
1. Click the **"New bucket"** button (usually green, top right)
2. In the modal that appears:
   - **Name**: Enter `student-documents` (exactly as shown, all lowercase)
   - **Public bucket**: Toggle to **OFF** (make sure it's set to private/not public)
   - Leave **File size limit** empty (or set to 10MB if you want an extra safety limit)
   - Leave **Allowed MIME types** empty (we validate in the app)
3. Click **"Create bucket"**
4. Wait for confirmation - you should see the bucket appear in your list

---

## Part 2: Set Up Storage Policies

You need to create **4 policies** for the `student-documents` bucket. Each policy controls a different operation (INSERT, SELECT, UPDATE, DELETE).

### Policy 1: Users can upload their own documents (INSERT)

1. In Storage, click on the **`student-documents`** bucket name
2. Click the **"Policies"** tab at the top
3. Click **"New policy"** button
4. In the modal:

   **Policy name:**
   - Enter: `Users can upload own documents`

   **Allowed operation:**
   - ✅ Check **"INSERT"** only (uncheck others if checked)

   **Target roles:**
   - Leave as default (or select "authenticated" if you want to be explicit)

   **Policy definition:**
   - Copy and paste this EXACT SQL:
   ```sql
   bucket_id = 'student-documents' AND
   (storage.foldername(name))[1] = auth.uid()::text
   ```

5. Click **"Review"** (green button at bottom right)
6. Review the policy summary, then click **"Save policy"**

---

### Policy 2: Users can read accessible documents (SELECT)

1. Still in the Policies tab, click **"New policy"** again
2. In the modal:

   **Policy name:**
   - Enter: `Users can read accessible documents`

   **Allowed operation:**
   - ✅ Check **"SELECT"** only

   **Target roles:**
   - Leave as default

   **Policy definition:**
   - Copy and paste this EXACT SQL:
   ```sql
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
   ```

3. Click **"Review"**, then **"Save policy"**

---

### Policy 3: Users can update their own uploads (UPDATE)

1. Click **"New policy"** again
2. In the modal:

   **Policy name:**
   - Enter: `Users can update own uploads`

   **Allowed operation:**
   - ✅ Check **"UPDATE"** only

   **Target roles:**
   - Leave as default

   **Policy definition:**
   - Copy and paste this EXACT SQL:
   ```sql
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
   ```

3. Click **"Review"**, then **"Save policy"**

---

### Policy 4: Users can delete their own uploads (DELETE)

1. Click **"New policy"** one more time
2. In the modal:

   **Policy name:**
   - Enter: `Users can delete own uploads`

   **Allowed operation:**
   - ✅ Check **"DELETE"** only

   **Target roles:**
   - Leave as default

   **Policy definition:**
   - Copy and paste this EXACT SQL:
   ```sql
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
   ```

3. Click **"Review"**, then **"Save policy"**

---

## Part 3: Verify Your Setup

### Check Policies List
After creating all 4 policies, you should see:
- ✅ Users can upload own documents (INSERT)
- ✅ Users can read accessible documents (SELECT)
- ✅ Users can update own uploads (UPDATE)
- ✅ Users can delete own uploads (DELETE)

### Quick Test
1. Go to your portal and log in as a student
2. Navigate to Profile → Documents
3. Try uploading a test PDF file
4. Verify the file appears in the list
5. Try downloading it
6. Verify you can delete it

---

## Troubleshooting

### Error: "new row violates row-level security policy"
- **Cause**: Policy is too restrictive or bucket name doesn't match
- **Fix**: Double-check that:
  - Bucket name is exactly `student-documents` (lowercase)
  - The SQL in your policy matches exactly (including the `bucket_id` check)
  - You've run the database schema (parent_student_links and mentor_student_links tables exist)

### Error: "permission denied for bucket"
- **Cause**: Policy missing or not applied correctly
- **Fix**: 
  - Verify all 4 policies are created
  - Check that each policy has the correct "Allowed operation" checked
  - Make sure you're logged in when testing

### Files upload but can't be downloaded
- **Cause**: SELECT policy might be incorrect
- **Fix**: 
  - Check the SELECT policy SQL is correct
  - Verify parent/mentor links exist in the database
  - Check that the user role is set correctly in the users table

### "bucket does not exist" error
- **Cause**: Bucket not created or wrong name
- **Fix**: 
  - Verify bucket name is exactly `student-documents`
  - Check you're in the correct Supabase project
  - Recreate the bucket if needed

---

## Understanding the Policy Logic

### How folder structure works:
Files are stored as: `{user_id}/{category}/{filename}`

For example:
- `abc123/personal_statement/1234567890-my-statement.pdf`
- `abc123/cv/1234567891-my-cv.pdf`

### Policy breakdown:

1. **INSERT Policy**: Only allows uploads to folders matching the current user's ID
   - `(storage.foldername(name))[1]` gets the first folder in the path (the user_id)
   - `auth.uid()::text` gets the current authenticated user's ID

2. **SELECT Policy**: Allows reading files if:
   - You own the file (your user_id matches the folder)
   - OR you're a parent linked to the student (via parent_student_links table)
   - OR you're a mentor linked to the student (via mentor_student_links table)
   - OR you're an admin

3. **UPDATE/DELETE Policies**: Similar to SELECT but simpler - only own files or admin

---

## Alternative: Using SQL Editor (Advanced)

If you prefer SQL over the UI, you can also create policies using the SQL Editor:

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New query"**
3. Paste this entire block:

```sql
-- Policy 1: INSERT
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: SELECT
CREATE POLICY "Users can read accessible documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-documents' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.users u ON u.id = psl.student_id
      WHERE psl.parent_id = auth.uid()
      AND (storage.foldername(name))[1] = u.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM public.mentor_student_links msl
      JOIN public.users u ON u.id = msl.student_id
      WHERE msl.mentor_id = auth.uid()
      AND (storage.foldername(name))[1] = u.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
);

-- Policy 3: UPDATE
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

-- Policy 4: DELETE
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

4. Click **"Run"** (or press Ctrl/Cmd + Enter)
5. Check for any errors in the output

---

## Summary Checklist

Before testing, make sure:
- [ ] Bucket `student-documents` is created (and private/not public)
- [ ] All 4 policies are created with correct names
- [ ] Each policy has the correct operation checked (INSERT, SELECT, UPDATE, DELETE)
- [ ] SQL in each policy matches exactly (especially bucket name)
- [ ] Database schema has been run (student_documents table exists)
- [ ] Parent/mentor links tables exist in your database

You're now ready to test file uploads in your portal! 🎉

