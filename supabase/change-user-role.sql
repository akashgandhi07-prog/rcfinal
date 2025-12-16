-- ============================================
-- CHANGE USER ROLES IN SUPABASE
-- ============================================

-- Example: Change a user to admin by email
UPDATE public.users
SET role = 'admin'
WHERE email = 'user@example.com';

-- Example: Change a user to mentor by email
UPDATE public.users
SET role = 'mentor'
WHERE email = 'mentor@example.com';

-- Example: Change a user to parent by email
UPDATE public.users
SET role = 'parent'
WHERE email = 'parent@example.com';

-- Example: Change a user to student by email
UPDATE public.users
SET role = 'student'
WHERE email = 'student@example.com';

-- Example: Change a user to admin by user ID
UPDATE public.users
SET role = 'admin'
WHERE id = 'user-uuid-here';

-- Example: View all users and their roles
SELECT id, email, full_name, role, approval_status, created_at
FROM public.users
ORDER BY created_at DESC;

-- Example: Find all admins
SELECT id, email, full_name, role
FROM public.users
WHERE role = 'admin';

-- Example: Find all mentors
SELECT id, email, full_name, role
FROM public.users
WHERE role = 'mentor';

-- Example: Bulk change - make all users with pending approval into students
-- UPDATE public.users
-- SET role = 'student'
-- WHERE approval_status = 'pending' AND role IS NULL;

